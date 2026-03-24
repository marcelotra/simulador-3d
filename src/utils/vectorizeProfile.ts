/**
 * Vectorize a technical profile drawing (JPG/PNG silhouette) into a Polygon String.
 * Specialized for the picture frame simulator (Full Upper Boundary extractor).
 */

const LUMA_THRESHOLD = 210;
const RDP_EPSILON = 0.5; // Precision: smaller = detail
const TRACE_SIZE = 400;

// ─── Step 1: image → binary canvas ──────────────────────────────────────────

function loadImageToBinary(base64: string): Promise<{ data: Uint8ClampedArray; w: number; h: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = TRACE_SIZE;
            canvas.height = TRACE_SIZE;
            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, TRACE_SIZE, TRACE_SIZE);

            const padding = TRACE_SIZE * 0.05;
            const innerSize = TRACE_SIZE - padding * 2;
            const scale = Math.min(innerSize / img.width, innerSize / img.height);
            const dx = (TRACE_SIZE - img.width * scale) / 2;
            const dy = (TRACE_SIZE - img.height * scale) / 2;
            
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);

            const { data } = ctx.getImageData(0, 0, TRACE_SIZE, TRACE_SIZE);
            resolve({ data, w: TRACE_SIZE, h: TRACE_SIZE });
        };
        img.onerror = reject;
        img.src = base64;
    });
}

function isSolid(data: Uint8ClampedArray, x: number, y: number, w: number): boolean {
    if (x < 0 || x >= w || y < 0 || y >= w) return false;
    const i = (y * w + x) * 4;
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    return luma < LUMA_THRESHOLD;
}

// ─── Step 2: Full Boundary Tracing (Moore neighborhood) ──────────────────────

type Point = { x: number; y: number };

const MOORE = [
    { dx: 1, dy: 0 }, { dx: 1, dy: 1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 },
    { dx: -1, dy: 0 }, { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
];

function traceBoundary(data: Uint8ClampedArray, w: number, h: number, startX: number, startY: number): Point[] {
    const points: Point[] = [];
    let curr = { x: startX, y: startY };
    let prevDir = 6;
    const maxIters = w * h;
    for (let iter = 0; iter < maxIters; iter++) {
        points.push({ ...curr });
        let found = false;
        for (let d = 0; d < 8; d++) {
            const dir = (prevDir + 6 + d) % 8;
            const nx = curr.x + MOORE[dir].dx;
            const ny = curr.y + MOORE[dir].dy;
            if (isSolid(data, nx, ny, w)) {
                prevDir = dir;
                curr = { x: nx, y: ny };
                found = true;
                break;
            }
        }
        if (!found) break;
        if (curr.x === startX && curr.y === startY && points.length > 5) break; 
    }
    return points;
}

function findLargestBoundary(data: Uint8ClampedArray, w: number, h: number): Point[] {
    let best: Point[] = [];
    const visited = new Uint8Array(w * h);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            if (isSolid(data, x, y, w) && !visited[y * w + x]) {
                let isEdge = false;
                for (let d = 0; d < 8; d += 2) {
                    if (!isSolid(data, x + MOORE[d].dx, y + MOORE[d].dy, w)) { isEdge = true; break; }
                }
                if (isEdge) {
                    const b = traceBoundary(data, w, h, x, y);
                    if (b.length > best.length) best = b;
                    for (const p of b) visited[p.y * w + p.x] = 1;
                }
            }
        }
    }
    return best;
}

// ─── Step 3: Extract the Upper "L-like" perimeter ───────────────────────────

function extractUpperFace(points: Point[]): Point[] {
    if (points.length < 10) return points;

    // Find leftmost and rightmost indices
    let minXIndex = 0, maxXIndex = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i].x < points[minXIndex].x) minXIndex = i;
        if (points[i].x > points[maxXIndex].x) maxXIndex = i;
    }

    const pathA: Point[] = [];
    const pathB: Point[] = [];

    // Path A: forward
    for (let i = minXIndex; ; i = (i + 1) % points.length) {
        pathA.push(points[i]);
        if (i === maxXIndex) break;
    }

    // Path B: backward
    for (let i = minXIndex; ; i = (i - 1 + points.length) % points.length) {
        pathB.push(points[i]);
        if (i === maxXIndex) break;
    }

    const sumA = pathA.reduce((s, p) => s + p.y, 0) / pathA.length;
    const sumB = pathB.reduce((s, p) => s + p.y, 0) / pathB.length;

    return (sumA < sumB) ? pathA : pathB;
}

// ─── Step 4: Ramer-Douglas-Peucker simplification ───────────────────────────

function perpendicularDist(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

function rdp(points: Point[], epsilon: number): Point[] {
    if (points.length <= 2) return points;
    let maxDist = 0, maxIdx = 0;
    const end = points.length - 1;
    for (let i = 1; i < end; i++) {
        const d = perpendicularDist(points[i], points[0], points[end]);
        if (d > maxDist) { maxDist = d; maxIdx = i; }
    }
    if (maxDist > epsilon) {
        return [
            ...rdp(points.slice(0, maxIdx + 1), epsilon),
            ...rdp(points.slice(maxIdx), epsilon).slice(1),
        ];
    }
    return [points[0], points[end]];
}

// ─── Step 5: normalize + generate Clean Polygon ──────────────────────────────

function toPolygonString(points: Point[], allPoints: Point[]): string {
    if (!points.length) return '';
    
    const xs = allPoints.map(p => p.x);
    const ys = allPoints.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys); 
    
    // We want the total vertical depth of the drawing (minY to maxY of silhuette)
    // to map to 0-100% in the simulator.
    const w = maxX - minX || 1, h = maxY - minY || 1;

    const polyPoints = points.map(p => {
        const xPercent = ((p.x - minX) / w) * 100;
        const yPercent = ((p.y - minY) / h) * 100;
        return `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`;
    });

    // We NO LONGER push extra closing points (100% 100% etc)
    // because they create huge fake slices in the 3D renderer.
    // CSS clip-path will automatically close the polygon anyway.
    return `polygon(${polyPoints.join(', ')})`;
}

function polygonToSVGPath(poly: string): string {
    const pairs = poly.replace('polygon(', '').replace(')', '').split(', ');
    const points = pairs.map(pair => {
        const coords = pair.trim().split(/\s+/);
        return { x: parseFloat(coords[0]), y: parseFloat(coords[1]) };
    });
    if (!points.length) return '';
    const [first, ...rest] = points;
    // Closing it with the average Y to help the preview visually
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function vectorizeProfileImage(base64: string): Promise<string | null> {
    try {
        const { data, w, h } = await loadImageToBinary(base64);
        const fullLoop = findLargestBoundary(data, w, h);
        if (fullLoop.length < 15) return null;
        
        const surface = extractUpperFace(fullLoop);
        const simplified = rdp(surface, RDP_EPSILON);
        
        return toPolygonString(simplified, fullLoop);
    } catch (err) {
        console.error('Vectorization error:', err);
        return null;
    }
}

export function svgPathToDataURL(polygon: string, size = 100): string {
    const path = polygonToSVGPath(polygon);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <path d="${path}" fill="#94a3b8" stroke="#1e293b" stroke-width="0.3" stroke-linejoin="round"/>
</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

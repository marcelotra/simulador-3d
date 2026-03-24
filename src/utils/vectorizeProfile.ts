/**
 * Vectorize a technical profile drawing (JPG/PNG silhouette) into a Polygon String.
 * Specialized for the picture frame simulator (Front Surface Contour extractor).
 */

/** Threshold: pixels darker than this (0–255 luminance) are considered "solid" */
const LUMA_THRESHOLD = 210;

/** RDP epsilon — precision of the curve. Lower = more detail. */
const RDP_EPSILON = 0.8;

/** Target canvas size for tracing (larger = more detail, slower) */
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

// ─── Step 2: Surface Contour Extractor (y = f(x)) ────────────────────────────

type Point = { x: number; y: number };

/** 
 * Scans for the "upper perimeter" (front face) of the profile silhouette.
 * For each column, it finds the FIRST solid pixel from top to bottom.
 */
function extractUpperContour(data: Uint8ClampedArray, w: number, h: number): Point[] {
    const rawPoints: Point[] = [];
    
    // Find the bounding box first to focus our scan
    let minX = w, maxX = 0, minY = h, maxY = 0;
    let foundSolid = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (isSolid(data, x, y, w)) {
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                foundSolid = true;
            }
        }
    }
    if (!foundSolid) return [];

    // For each x coordinate, find the top-most solid pixel
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            if (isSolid(data, x, y, w)) {
                rawPoints.push({ x, y });
                break; // move to next column once we find the top surface
            }
        }
    }
    
    return rawPoints;
}

// ─── Step 3: Ramer-Douglas-Peucker simplification ───────────────────────────

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

// ─── Step 4: normalize + generate Polygon String ───────────────────────────

function toPolygonString(points: Point[]): string {
    if (!points.length) return '';
    
    // Total bounding box of the whole silhuette (re-calculate from all pixels if possible, 
    // but using raw points min/max is fine since we extracted surface which spans minX/maxX).
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    
    const w = maxX - minX || 1, h = maxY - minY || 1;

    // Normalizing X to 0-100 and Y to 0-100 (relative to silhouette height)
    // The simulator expects Y=0 for front-most, but our silhouette might have y=0 as top.
    // Actually, minY is the highest part, so (y - minY) will be 0 for the highest crest.
    const polyPoints = points.map(p => {
        const xPercent = ((p.x - minX) / w) * 100;
        const yPercent = ((p.y - minY) / h) * 100; // Correct: the highest point is 0% depth
        return `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`;
    });

    // Add back the "back face" points to close the polygon (needed for preview clipPath)
    // We want a closed L or [ shape.
    // From rightmost surface point to bottom-right, then bottom-left, then back to leftmost surface point.
    polyPoints.push(`100% 100%`);
    polyPoints.push(`0% 100%`);

    return `polygon(${polyPoints.join(', ')})`;
}

/** Converts a polygon string back to a standard SVG path for previewing */
function polygonToSVGPath(poly: string): string {
    const pairs = poly.replace('polygon(', '').replace(')', '').split(', ');
    const points = pairs.map(pair => {
        const coords = pair.trim().split(/\s+/);
        const x = parseFloat(coords[0]);
        const y = parseFloat(coords[1]);
        return { x, y };
    });

    if (!points.length) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function vectorizeProfileImage(base64: string): Promise<string | null> {
    try {
        const { data, w, h } = await loadImageToBinary(base64);
        const surface = extractUpperContour(data, w, h);
        if (surface.length < 10) return null;
        
        const simplified = rdp(surface, RDP_EPSILON);
        return toPolygonString(simplified);
    } catch (err) {
        console.error('Vectorization error:', err);
        return null;
    }
}

export function svgPathToDataURL(polygon: string, size = 100): string {
    const path = polygonToSVGPath(polygon);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <path d="${path}" fill="#94a3b8" stroke="#1e293b" stroke-width="0.5" stroke-linejoin="round"/>
</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

/**
 * Vectorize a technical profile drawing (JPG/PNG silhouette) into an SVG path string.
 * 100% client-side using Canvas API — no external dependencies.
 *
 * Pipeline:
 *   1. Draw image to offscreen canvas
 *   2. Threshold pixels to binary (dark = solid, bright = background)
 *   3. Trace the outer boundary of the largest solid region (Moore neighborhood)
 *   4. Simplify with Ramer-Douglas-Peucker
 *   5. Normalize to a 0-100 viewBox
 *   6. Return as SVG path string
 */

/** Threshold: pixels darker than this (0–255 luminance) are considered "solid" */
const LUMA_THRESHOLD = 180;

/** RDP epsilon — higher = fewer points, less detail */
const RDP_EPSILON = 1.5;

/** Target canvas size for tracing (larger = more detail, slower) */
const TRACE_SIZE = 300;

// ─── Step 1: image → binary canvas ──────────────────────────────────────────

function loadImageToBinary(base64: string): Promise<{ data: Uint8ClampedArray; w: number; h: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = TRACE_SIZE;
            canvas.height = TRACE_SIZE;
            const ctx = canvas.getContext('2d')!;
            // White background, then draw scaled image
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, TRACE_SIZE, TRACE_SIZE);

            // Maintain aspect ratio
            const scale = Math.min(TRACE_SIZE / img.width, TRACE_SIZE / img.height);
            const dx = (TRACE_SIZE - img.width * scale) / 2;
            const dy = (TRACE_SIZE - img.height * scale) / 2;
            ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);

            const { data } = ctx.getImageData(0, 0, TRACE_SIZE, TRACE_SIZE);
            resolve({ data, w: TRACE_SIZE, h: TRACE_SIZE });
        };
        img.onerror = reject;
        img.src = base64;
    });
}

function isSolid(data: Uint8ClampedArray, x: number, y: number, w: number): boolean {
    const i = (y * w + x) * 4;
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    return luma < LUMA_THRESHOLD;
}

// ─── Step 2: boundary tracing (Moore neighborhood / square tracing) ──────────

type Point = { x: number; y: number };

const MOORE = [
    { dx: 1, dy: 0 }, { dx: 1, dy: 1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 },
    { dx: -1, dy: 0 }, { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
];

function findStartPixel(data: Uint8ClampedArray, w: number, h: number): Point | null {
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (isSolid(data, x, y, w)) return { x, y };
        }
    }
    return null;
}

function traceBoundary(data: Uint8ClampedArray, w: number, h: number): Point[] {
    const start = findStartPixel(data, w, h);
    if (!start) return [];

    const points: Point[] = [];
    let curr = { ...start };
    let prevDir = 6; // came from bottom-left direction initially

    const key = (p: Point) => `${p.x},${p.y}`;
    const visited = new Set<string>();

    for (let iter = 0; iter < w * h * 4; iter++) {
        points.push({ ...curr });
        visited.add(key(curr));

        // Search clockwise from backtrack direction
        let found = false;
        for (let d = 0; d < 8; d++) {
            const dir = (prevDir + 6 + d) % 8; // start slightly counter-clockwise
            const nx = curr.x + MOORE[dir].dx;
            const ny = curr.y + MOORE[dir].dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && isSolid(data, nx, ny, w)) {
                prevDir = dir;
                curr = { x: nx, y: ny };
                found = true;
                break;
            }
        }
        if (!found) break;
        if (curr.x === start.x && curr.y === start.y && points.length > 4) break;
    }
    return points;
}

// ─── Step 3: Ramer-Douglas-Peucker simplification ───────────────────────────

function perpendicularDist(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

function rdp(points: Point[], epsilon: number): Point[] {
    if (points.length <= 2) return points;
    let maxDist = 0;
    let maxIdx = 0;
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

// ─── Step 4: normalize + generate SVG path ──────────────────────────────────

function normalize(points: Point[], size: number): Point[] {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scale = Math.min(size / rangeX, size / rangeY);
    const offX = (size - rangeX * scale) / 2;
    const offY = (size - rangeY * scale) / 2;
    return points.map(p => ({
        x: Math.round(((p.x - minX) * scale + offX) * 10) / 10,
        y: Math.round(((p.y - minY) * scale + offY) * 10) / 10,
    }));
}

function toSVGPath(points: Point[]): string {
    if (!points.length) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Vectorizes a silhouette image (base64 JPG/PNG) into an SVG path string.
 * Returns null if no solid region is found.
 */
export async function vectorizeProfileImage(base64: string): Promise<string | null> {
    const { data, w, h } = await loadImageToBinary(base64);
    const raw = traceBoundary(data, w, h);
    if (raw.length < 6) return null;
    const simplified = rdp(raw, RDP_EPSILON);
    const normalized = normalize(simplified, 100);
    return toSVGPath(normalized);
}

/** Wraps the path in a minimal SVG string for preview */
export function svgPathToDataURL(path: string, size = 100): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <path d="${path}" fill="#64748b" stroke="none"/>
</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

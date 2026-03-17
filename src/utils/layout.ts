export interface Segment {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    imgX: number;
    imgY: number;
}

export function getSegments(
    width: number, 
    height: number, 
    splitType: string, 
    splitColumns: number, 
    splitGap: number, 
    splitHeightRatio: number
): Segment[] {
    const segments: Segment[] = [];
    const W = Number(width);
    const H = Number(height);
    const gap = Number(splitGap);
    const cols = Number(splitColumns);

    if (splitType === 'single') {
        segments.push({ id: 's1', x: 0, y: 0, w: W, h: H, imgX: 0, imgY: 0 });
    } else if (splitType === 'vertical') {
        const segW = W / cols;
        for (let i = 0; i < cols; i++) {
            segments.push({
                id: `v${i}`,
                x: i * (segW + gap),
                y: 0,
                w: segW,
                h: H,
                imgX: (i * segW) / W * 100,
                imgY: 0
            });
        }
    } else if (splitType === 'horizontal') {
        const rows = cols; // Reusing splitColumns for rows
        const segH = H / rows;
        for (let i = 0; i < rows; i++) {
            segments.push({
                id: `h${i}`,
                x: 0,
                y: i * (segH + gap),
                w: W,
                h: segH,
                imgX: 0,
                imgY: (i * segH) / H * 100
            });
        }
    } else if (splitType === 'asymmetric') {
        const segW = W / 3;
        const sideH = H * splitHeightRatio;
        const offsetH = (H - sideH) / 2;
        
        segments.push({ id: 'a1', x: 0, y: offsetH, w: segW, h: sideH, imgX: 0, imgY: offsetH / H * 100 });
        segments.push({ id: 'a2', x: segW + gap, y: 0, w: segW, h: H, imgX: segW / W * 100, imgY: 0 });
        segments.push({ id: 'a3', x: (segW + gap) * 2, y: offsetH, w: segW, h: sideH, imgX: (segW * 2) / W * 100, imgY: offsetH / H * 100 });
    } else if (splitType === 'grid') {
        const segW = W / cols;
        const segH = H / cols; // Squared grid
        for (let r = 0; r < cols; r++) {
            for (let c = 0; c < cols; c++) {
                segments.push({
                    id: `g${r}-${c}`,
                    x: c * (segW + gap),
                    y: r * (segH + gap),
                    w: segW,
                    h: segH,
                    imgX: (c * segW) / W * 100,
                    imgY: (r * segH) / H * 100
                });
            }
        }
    }
    return segments;
}

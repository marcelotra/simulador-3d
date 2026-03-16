import { useEffect, useState, useRef, useCallback } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function Frame2D() {
    const { width, height, passepartoutWidth, passepartoutColor, userImage, availableFrames, frameProfileId, hasFrame, paperMargin } = useSimulatorStore();
    const [textureUrl, setTextureUrl] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentFrame = availableFrames.find(f => f.id === frameProfileId) || availableFrames[0];
    const fw = hasFrame ? (currentFrame ? currentFrame.frameWidth : 5.7) : 0;

    useEffect(() => {
        if (!currentFrame) return;

        setTextureUrl(null);

        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tCtx = tempCanvas.getContext('2d');
            if (!tCtx) return;

            tCtx.drawImage(img, 0, 0);
            const imgData = tCtx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;

            let rightMost = 0;
            let leftMost = img.width;
            let topMost = img.height;
            let bottomMost = 0;

            for (let x = 0; x < img.width; x++) {
                for (let y = 0; y < img.height; y++) {
                    const i = (y * img.width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    const isTransparent = a < 10;
                    const isWhiteBg = r > 245 && g > 245 && b > 245 && a > 240;

                    if (!isTransparent && !isWhiteBg) {
                        rightMost = Math.max(rightMost, x);
                        leftMost = Math.min(leftMost, x);
                        topMost = Math.min(topMost, y);
                        bottomMost = Math.max(bottomMost, y);
                    }
                }
            }

            if (leftMost > rightMost) {
                leftMost = 0;
                rightMost = img.width - 1;
                topMost = 0;
                bottomMost = img.height - 1;
            }

            const rawWidth = rightMost - leftMost + 1;
            const rawHeight = bottomMost - topMost + 1;

            const isDefault = currentFrame.id === '149';
            const cropWidth = isDefault ? Math.floor(rawWidth * 0.86) : rawWidth;

            const canvas = document.createElement('canvas');
            canvas.width = cropWidth;
            canvas.height = rawHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, leftMost, topMost, cropWidth, rawHeight, 0, 0, cropWidth, rawHeight);
                setTextureUrl(canvas.toDataURL('image/png'));
            }
        };
        img.src = currentFrame.textureUrl;
    }, [currentFrame.id, currentFrame.textureUrl]);

    const w = Number(width);
    const h = Number(height);
    const p = Number(hasFrame ? passepartoutWidth : 0);

    const outerW = w + (paperMargin * 2) + fw * 2;
    const outerH = h + (paperMargin * 2) + fw * 2;

    const s = 10; // 1cm = 10px

    const framePxW = outerW * s;
    const framePxH = outerH * s;

    // Recalculate scale whenever container size or frame dimensions change
    const recalcScale = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const padding = 64; // 32px on each side
        const availW = el.clientWidth - padding;
        const availH = el.clientHeight - padding;
        const scaleW = availW / framePxW;
        const scaleH = availH / framePxH;
        setScale(Math.min(scaleW, scaleH, 1));
    }, [framePxW, framePxH]);

    // Observe container resize
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        recalcScale();
        const ro = new ResizeObserver(recalcScale);
        ro.observe(el);
        return () => ro.disconnect();
    }, [recalcScale]);

    if (hasFrame && !textureUrl) return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-[#f4f4f5]">
            <div className="text-zinc-400 text-xs animate-pulse">Processando moldura...</div>
        </div>
    );

    const stickStyle = (length: number) => ({
        width: `${length * s}px`,
        height: `${fw * s}px`,
        backgroundImage: `url(${textureUrl})`,
        backgroundSize: `auto ${fw * s}px`,
        backgroundRepeat: 'repeat-x',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        transformOrigin: '0 0',
    });

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden select-none bg-[#f4f4f5]"
        >
            <div
                className="relative transition-all duration-300 ease-in-out bg-[#2a1f1a]"
                style={{
                    width: `${framePxW}px`,
                    height: `${framePxH}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    boxShadow: '15px 20px 45px rgba(0, 0, 0, 0.65)'
                }}
            >
                {/* TOP STICK */}
                {hasFrame && textureUrl && (
                    <div style={{
                        ...stickStyle(outerW),
                        clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                    }} />
                )}

                {/* RIGHT STICK */}
                {hasFrame && textureUrl && (
                    <div style={{
                        ...stickStyle(outerH),
                        clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                        transform: `translate(${outerW * s}px, 0) rotate(90deg)`
                    }} />
                )}

                {/* BOTTOM STICK */}
                {hasFrame && textureUrl && (
                    <div style={{
                        ...stickStyle(outerW),
                        clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                        transform: `translate(${outerW * s}px, ${outerH * s}px) rotate(180deg)`
                    }} />
                )}

                {/* LEFT STICK */}
                {hasFrame && textureUrl && (
                    <div style={{
                        ...stickStyle(outerH),
                        clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                        transform: `translate(0, ${outerH * s}px) rotate(-90deg)`
                    }} />
                )}

                {/* INNER CONTENT AREA */}
                <div
                    className="absolute shadow-inner"
                    style={{
                        top: `${fw * s}px`,
                        left: `${fw * s}px`,
                        width: `${(w + paperMargin * 2) * s}px`,
                        height: `${(h + paperMargin * 2) * s}px`,
                        backgroundColor: p > 0 ? passepartoutColor : 'transparent',
                        padding: `${p * s}px`,
                        boxShadow: hasFrame ? 'inset 0px 4px 15px rgba(0,0,0,0.5)' : 'none'
                    }}
                >
                    {/* PAPER AREA */}
                    <div
                        className="w-full h-full bg-white relative shadow-sm"
                        style={{ padding: `${paperMargin * s}px` }}
                    >
                        {/* ARTWORK */}
                        <div className="w-full h-full relative overflow-hidden">
                            {userImage ? (
                                <img
                                    src={userImage}
                                    alt="Arte do Usuário"
                                    className="w-full h-full object-cover"
                                    onLoad={() => console.log('Imagem carregada com sucesso')}
                                    onError={(e) => console.error('Erro ao carregar imagem:', e)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-medium text-sm bg-zinc-50">
                                    Bandeja Vazia
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

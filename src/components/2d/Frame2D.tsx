import { useEffect, useState, useRef, useCallback } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { getSegments } from '../../utils/layout';

export function Frame2D() {
    const { 
        width, height, passepartoutWidth, passepartoutColor, 
        userImage, availableFrames, frameProfileId, hasFrame, 
        paperMargin, splitType, splitColumns, splitGap, splitHeightRatio,
        cameraAngle
    } = useSimulatorStore();
    const [textureUrl, setTextureUrl] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentFrame = availableFrames.find(f => f.id === frameProfileId) || availableFrames[0];
    const fw = hasFrame ? (currentFrame ? currentFrame.frameWidth : 5.7) : 0;
    const fd = hasFrame ? (currentFrame?.frameDepth || fw * 1.5) : 0; // Profundidade física (parede externa)
    const rabbetDepth = hasFrame ? (currentFrame?.rabbetDepth || fd * 0.4) : 0; // Degrau interno até o vidro
    const profileType = currentFrame?.profileType || 'caixa';
    const profileSVG = currentFrame?.profileSVG || '';

    const s = 10; // 1cm = 10px

    const segments = getSegments(width, height, splitType, splitColumns, splitGap, splitHeightRatio);

    // Helper para extrair pontos do polígono CSS
    const parseProfilePoints = (poly: string) => {
        // Suporta "polygon(x% y%, ...)" ou apenas lista de pontos
        const pts = poly.match(/[\d.]+%[\s,]+[\d.]+%/g);
        if (!pts) return [];
        return pts.map(p => {
            const clean = p.replace(/%/g, '').replace(/,/g, ' ').trim();
            const [x, y] = clean.split(/\s+/).map(v => parseFloat(v));
            return { x, y };
        });
    };

    // --- TEXTURE PROCESSING ---
    useEffect(() => {
        if (!currentFrame) return;
        setTextureUrl(null);
        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width; tempCanvas.height = img.height;
            const tCtx = tempCanvas.getContext('2d');
            if (!tCtx) return;
            tCtx.drawImage(img, 0, 0);
            const imgData = tCtx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;
            let rightMost = 0, leftMost = img.width, topMost = img.height, bottomMost = 0;
            for (let x = 0; x < img.width; x++) {
                for (let y = 0; y < img.height; y++) {
                    const i = (y * img.width + x) * 4;
                    const isTransparent = data[i+3] < 10;
                    const isWhiteBg = data[i] > 245 && data[i+1] > 245 && data[i+2] > 245 && data[i+3] > 240;
                    if (!isTransparent && !isWhiteBg) {
                        rightMost = Math.max(rightMost, x); leftMost = Math.min(leftMost, x);
                        topMost = Math.min(topMost, y); bottomMost = Math.max(bottomMost, y);
                    }
                }
            }
            if (leftMost > rightMost) { leftMost = 0; rightMost = img.width - 1; topMost = 0; bottomMost = img.height - 1; }
            const rawWidth = rightMost - leftMost + 1;
            const rawHeight = bottomMost - topMost + 1;
            const isDefault = currentFrame.id === '149';
            const cropWidth = isDefault ? Math.floor(rawWidth * 0.86) : rawWidth;
            const canvas = document.createElement('canvas');
            canvas.width = cropWidth; canvas.height = rawHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (currentFrame.invertTexture) {
                    ctx.translate(0, rawHeight);
                    ctx.scale(1, -1);
                }
                ctx.drawImage(img, leftMost, topMost, cropWidth, rawHeight, 0, 0, cropWidth, rawHeight);
                setTextureUrl(canvas.toDataURL('image/png'));
            }
        };
        img.src = currentFrame.textureUrl;
    }, [currentFrame.id, currentFrame.textureUrl]);

    // --- SCALE & BOUNDS ---
    // Obter posições únicas para determinar índices de coluna/linha independentemente do desalinhamento
    const uniqueX = Array.from(new Set(segments.map(s => s.x))).sort((a, b) => a - b);
    const uniqueY = Array.from(new Set(segments.map(s => s.y))).sort((a, b) => a - b);

    const getCompositionSize = () => {
        if (!segments.length) return { w: 0, h: 0 };
        
        let maxRight = 0;
        let maxBottom = 0;

        segments.forEach(seg => {
            const segOuterW = seg.w + (paperMargin * 2) + fw * 2;
            const segOuterH = seg.h + (paperMargin * 2) + fw * 2;
            
            const colIndex = uniqueX.indexOf(seg.x);
            const rowIndex = uniqueY.indexOf(seg.y);

            let posX = seg.x;
            let posY = seg.y;

            if (splitType === 'vertical' || splitType === 'asymmetric' || splitType === 'grid') {
                posX += colIndex * (fw * 2 + paperMargin * 2);
            }
            if (splitType === 'horizontal' || splitType === 'grid') {
                posY += rowIndex * (fw * 2 + paperMargin * 2);
            }

            maxRight = Math.max(maxRight, posX + segOuterW);
            maxBottom = Math.max(maxBottom, posY + segOuterH);
        });

        return { w: maxRight, h: maxBottom };
    };

    const compSize = getCompositionSize();
    const outerW = compSize.w;
    const outerH = compSize.h;

    const recalcScale = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const padding = 64;
        const availW = el.clientWidth - padding;
        const availH = el.clientHeight - padding;
        const scaleW = availW / (outerW * s);
        const scaleH = availH / (outerH * s);
        setScale(Math.min(scaleW, scaleH, 1));
    }, [outerW, outerH]);

    useEffect(() => {
        recalcScale();
        const ro = new ResizeObserver(recalcScale);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [recalcScale]);

    if (hasFrame && !textureUrl) return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-[#f4f4f5]">
            <div className="text-zinc-400 text-xs animate-pulse">Processando moldura...</div>
        </div>
    );

    const getCameraTransform = () => {
        switch (cameraAngle) {
            case 'left': return 'rotateY(25deg) rotateX(5deg) scale(0.85)';
            case 'right': return 'rotateY(-25deg) rotateX(5deg) scale(0.85)';
            case 'top-left': return 'rotateX(20deg) rotateY(20deg) scale(0.85)';
            case 'bottom-right': return 'rotateX(-20deg) rotateY(-20deg) scale(0.85)';
            case 'center':
            default: return 'rotateX(0deg) rotateY(0deg) scale(1)';
        }
    };

    const ProfileSticks = ({ 
        length, direction, rotation, tx, ty 
    }: { 
        length: number, 
        direction: 'to bottom' | 'to top' | 'to right' | 'to left',
        rotation: number,
        tx: number,
        ty: number
    }) => {
        const points = profileType === 'curvo' && profileSVG ? parseProfilePoints(profileSVG) : [];
        if (points.length < 2) {
            // Fallback para molduras não curvas ou sem SVG
            return (
                <div style={{
                    width: `${length * s}px`,
                    height: `${fw * s}px`,
                    backgroundImage: (profileType === 'reto' ? `url(${textureUrl})` : `linear-gradient(${direction}, rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${textureUrl})`),
                    backgroundSize: `auto ${fw * s}px`,
                    backgroundRepeat: 'repeat-x',
                    position: 'absolute',
                    top: 0, left: 0,
                    transformOrigin: '0 0',
                    transform: `translate(${tx * s}px, ${ty * s}px) rotate(${rotation}deg)`,
                    clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                }} />
            );
        }

        // Otimizar pontos: remover duplicados e fatias insignificantes (< 1%) para clareza
        const optimized = points.reduce((acc, p) => {
            if (acc.length === 0) return [p];
            const last = acc[acc.length - 1];
            // Se o deslocamento X for menor que 1% da largura, ignora para evitar falhas de subpixel
            if (Math.abs(p.x - last.x) < 1.0 && acc.length > 1) return acc;
            return [...acc, p];
        }, [] as {x: number, y: number}[]).sort((a, b) => a.x - b.x);
        
        // Cor média para preencher vãos (marrom dourado para Perfil 149)
        const woodColor = '#8a6d3b'; 
        
        return (
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                transformOrigin: '0 0',
                transform: `translate(${tx * s}px, ${ty * s}px) rotate(${rotation}deg)`,
                transformStyle: 'preserve-3d',
            }}>
                {/* Base sólida de vedação (evita riscas brancas) */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: `${length * s}px`,
                    height: `${fw * s}px`,
                    backgroundColor: woodColor,
                    transform: `translateZ(-${fd * s}px)`,
                    clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                }} />

                {optimized.map((p, i) => {
                    if (i === optimized.length - 1) return null;
                    const pNext = optimized[i+1];
                    const sliceW = ((pNext.x - p.x) / 100) * fw;
                    const sliceZ = ((p.y + pNext.y) / 200) * fd;
                    const offsetFront = (p.x / 100) * fw;
                    
                    const fullWidth = length * s;
                    
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            width: `${fullWidth + 2}px`, // Sobreposição lateral
                            height: `${sliceW * s + 0.8}px`, // Sobreposição vertical para fechar vãos
                            top: `${offsetFront * s - 0.4}px`,
                            left: `-1px`,
                            backgroundColor: woodColor, // Cor de fundo sólida para evitar vácuo branco
                            backgroundImage: `url(${textureUrl})`,
                            backgroundSize: `auto ${fw * s}px`,
                            backgroundPosition: `0 -${offsetFront * s}px`,
                            backgroundRepeat: 'repeat-x',
                            transform: `translateZ(-${sliceZ * s}px)`,
                            backfaceVisibility: 'hidden',
                            transformStyle: 'preserve-3d',
                            // Clip-path com ajuste de margem técnica
                            clipPath: `polygon(
                                ${offsetFront * s}px 0, 
                                ${fullWidth - offsetFront * s}px 0, 
                                ${fullWidth - (offsetFront + sliceW) * s}px 100%, 
                                ${(offsetFront + sliceW) * s}px 100%
                            )`,
                            filter: `brightness(${1 - (pNext.y / 800)})`, // Shading ainda mais suave para ver a textura
                        }} />
                    );
                })}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden select-none bg-[#f4f4f5]" style={{ perspective: '2500px' }}>
            <div 
                className="relative transition-all duration-700 ease-out preserve-3d"
                style={{
                    width: `${outerW * s * scale}px`,
                    height: `${outerH * s * scale}px`,
                    transform: getCameraTransform(),
                    transformStyle: 'preserve-3d',
                }}
            >
                <div 
                    className="absolute top-0 left-0 transition-all duration-300 ease-in-out"
                    style={{
                        width: `${outerW * s}px`,
                        height: `${outerH * s}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {segments.map((seg) => {
                    const segOuterW = seg.w + (paperMargin * 2) + fw * 2;
                    const segOuterH = seg.h + (paperMargin * 2) + fw * 2;

                    const colIndex = uniqueX.indexOf(seg.x);
                    const rowIndex = uniqueY.indexOf(seg.y);

                    let posX = seg.x;
                    let posY = seg.y;

                    if (splitType === 'vertical' || splitType === 'asymmetric' || splitType === 'grid') {
                        posX += colIndex * (fw * 2 + paperMargin * 2);
                    }
                    if (splitType === 'horizontal' || splitType === 'grid') {
                        posY += rowIndex * (fw * 2 + paperMargin * 2);
                    }
                    
                    const sideStyle = (w: number, h: number, brightness = 0.8) => ({
                        width: `${w * s}px`,
                        height: `${h * s}px`,
                        backgroundImage: `url(${textureUrl})`,
                        backgroundSize: '100% 100%',
                        position: 'absolute' as const,
                        filter: `brightness(${brightness})`, // Luminosidade ajustada para ver a textura
                    });

                    return (
                        <div
                            key={seg.id}
                            className="absolute transition-all duration-500 ease-in-out"
                            style={{
                                left: `${posX * s}px`,
                                top: `${posY * s}px`,
                                width: `${segOuterW * s}px`,
                                height: `${segOuterH * s}px`,
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* SOMBRA NATIVA 3D DO QUADRO */}
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%', height: '100%',
                                boxShadow: '10px 15px 30px rgba(0,0,0,0.4)',
                                transform: `translateZ(-${fd * s}px)`,
                                backgroundColor: 'transparent',
                                pointerEvents: 'none',
                            }} />

                            {/* CAIXA DA MOLDURA EM 3D */}
                            {hasFrame && textureUrl && (
                                <>
                                    {/* --- LATERAIS EXTERNAS (ESPESSURA) --- */}
                                    {/* Topo Externo */}
                                    <div style={{
                                        ...sideStyle(segOuterW, fd, 0.95), // Bem claro no topo
                                        top: 0, left: 0,
                                        transformOrigin: 'top',
                                        transform: 'rotateX(-90deg)',
                                        // Y vai de 0 (frente) a 100 (fundo). A parade externa vai do ponto inicial até o fundo (100).
                                        clipPath: profileSVG ? `polygon(0 ${parseProfilePoints(profileSVG)[0]?.y || 0}%, 100% ${parseProfilePoints(profileSVG)[0]?.y || 0}%, 100% 100%, 0 100%)` : 'none'
                                    }} />
                                    {/* Fundo Externo (Base) */}
                                    <div style={{
                                        ...sideStyle(segOuterW, fd, 0.65), // Menos escuro na base
                                        bottom: 0, left: 0,
                                        transformOrigin: 'bottom',
                                        transform: 'rotateX(90deg)',
                                        clipPath: profileSVG ? `polygon(0 ${parseProfilePoints(profileSVG)[0]?.y || 0}%, 100% ${parseProfilePoints(profileSVG)[0]?.y || 0}%, 100% 100%, 0 100%)` : 'none'
                                    }} />
                                    {/* Esquerda Externa */}
                                    <div style={{
                                        ...sideStyle(fd, segOuterH, 0.85),
                                        top: 0, left: 0,
                                        transformOrigin: 'left',
                                        transform: 'rotateY(90deg)',
                                        clipPath: profileSVG ? `polygon(${parseProfilePoints(profileSVG)[0]?.y || 0}% 0, 100% 0, 100% 100%, ${parseProfilePoints(profileSVG)[0]?.y || 0}% 100%)` : 'none'
                                    }} />
                                    {/* Direita Externa */}
                                    <div style={{
                                        ...sideStyle(fd, segOuterH, 0.85),
                                        top: 0, right: 0,
                                        transformOrigin: 'right',
                                        transform: 'rotateY(-90deg)',
                                        clipPath: profileSVG ? `polygon(0 0, ${100 - (parseProfilePoints(profileSVG)[0]?.y || 0)}% 0, ${100 - (parseProfilePoints(profileSVG)[0]?.y || 0)}% 100%, 0 100%)` : 'none'
                                    }} />

                                    {/* --- FRENTE DA MOLDURA EM CAMADAS (LAYERED EXTRUSION) --- */}
                                    {/* TOP STICK */}
                                    <ProfileSticks length={segOuterW} direction="to bottom" rotation={0} tx={0} ty={0} />

                                    {/* LEFT STICK */}
                                    <ProfileSticks length={segOuterH} direction="to right" rotation={-90} tx={0} ty={segOuterH} />

                                    {/* BOTTOM STICK */}
                                    <ProfileSticks length={segOuterW} direction="to top" rotation={180} tx={segOuterW} ty={segOuterH} />

                                    {/* RIGHT STICK */}
                                    <ProfileSticks length={segOuterH} direction="to left" rotation={90} tx={segOuterW} ty={0} />
                                </>
                            )}

                            {/* INNER AREA (ARTE E PASSE-PARTOUT) */}
                            <div
                                className="absolute shadow-inner overflow-hidden"
                                style={{
                                    top: `${fw * s}px`,
                                    left: `${fw * s}px`,
                                    width: `${(seg.w + paperMargin * 2) * s}px`,
                                    height: `${(seg.h + paperMargin * 2) * s}px`,
                                    backgroundColor: (passepartoutWidth > 0 && hasFrame) ? passepartoutColor : 'transparent',
                                    padding: `${(hasFrame ? passepartoutWidth : 0) * s}px`,
                                    boxShadow: hasFrame ? 'inset 0px 4px 20px rgba(0,0,0,0.6)' : 'none',
                                    transform: `translateZ(-${rabbetDepth * s}px)`,
                                }}
                            >
                                <div
                                    className="w-full h-full bg-white relative"
                                    style={{ padding: `${paperMargin * s}px` }}
                                >
                                    <div className="w-full h-full relative overflow-hidden bg-zinc-50">
                                        {userImage ? (
                                            <img
                                                src={userImage}
                                                alt="Arte"
                                                className="absolute max-w-none"
                                                style={{
                                                    width: `${Number(width) / seg.w * 100}%`,
                                                    height: `${Number(height) / seg.h * 100}%`,
                                                    left: `-${seg.imgX * (Number(width) / seg.w)}%`,
                                                    top: `-${seg.imgY * (Number(height) / seg.h)}%`,
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-medium text-[8px] uppercase tracking-widest">
                                                Vazio
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}

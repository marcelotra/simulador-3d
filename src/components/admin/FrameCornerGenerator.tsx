import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { toPng } from 'html-to-image';

export interface FrameCornerGeneratorProps {
    frameWidth: number;
    frameDepth: number;
    rabbetDepth: number;
    profileType: string;
    profileSVG?: string;
    textureUrl: string;
    invertTexture?: boolean;
}

export interface FrameCornerGeneratorRef {
    generateImage: () => Promise<string | null>;
}

export const FrameCornerGenerator = forwardRef<FrameCornerGeneratorRef, FrameCornerGeneratorProps>(({
    frameWidth, frameDepth, profileType, profileSVG, textureUrl, invertTexture
}, ref) => {
    const [processedTexture, setProcessedTexture] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Helpers
    const parseProfilePoints = (poly: string) => {
        const pts = poly.match(/[\d.]+%[\s,]+[\d.]+%/g);
        if (!pts) return [];
        return pts.map(p => {
            const clean = p.replace(/%/g, '').replace(/,/g, ' ').trim();
            const [x, y] = clean.split(/\s+/).map(v => parseFloat(v));
            return { x, y };
        });
    };

    const fw = frameWidth;
    const fd = frameDepth;
    const s = 15; // Escala (1cm = 15px para ficar com boa resolução)
    const legLength = 25; // O tamanho das "pernas" do L em cm

    // Processa a textura se precisar inverter
    useEffect(() => {
        if (!textureUrl) return;
        setProcessedTexture(null);
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Prevenir travamento do canvas
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
            
            const canvas = document.createElement('canvas');
            canvas.width = rawWidth; canvas.height = rawHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (invertTexture) {
                    ctx.translate(0, rawHeight);
                    ctx.scale(1, -1);
                }
                ctx.drawImage(img, leftMost, topMost, rawWidth, rawHeight, 0, 0, rawWidth, rawHeight);
                setProcessedTexture(canvas.toDataURL('image/png'));
            }
        };
        img.src = textureUrl;
    }, [textureUrl, invertTexture]);

    useImperativeHandle(ref, () => ({
        generateImage: async () => {
            if (!containerRef.current || !processedTexture) return null;
            try {
                // Remove bg transparente para melhor captura do jpeg final (ou manter PNG)
                const dataUrl = await toPng(containerRef.current, {
                    cacheBust: true,
                    pixelRatio: 2, // Retira retina-ready image (crisp detail)
                    backgroundColor: 'transparent'
                });
                return dataUrl;
            } catch (err) {
                console.error('Falha ao gerar preview da moldura', err);
                return null;
            }
        }
    }));

    if (!processedTexture) return null;

    const ProfileSticks = ({ 
        length, direction, rotation, tx, ty 
    }: { 
        length: number, 
        direction: string,
        rotation: number,
        tx: number,
        ty: number
    }) => {
        const points = profileType === 'curvo' && profileSVG ? parseProfilePoints(profileSVG) : [];
        if (points.length < 2) {
            return (
                <div style={{
                    width: `${length * s}px`,
                    height: `${fw * s}px`,
                    backgroundImage: (profileType === 'reto' ? `url(${processedTexture})` : `linear-gradient(${direction}, rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${processedTexture})`),
                    backgroundSize: `auto ${fw * s}px`,
                    position: 'absolute',
                    top: 0, left: 0,
                    transformOrigin: '0 0',
                    transform: `translate(${tx * s}px, ${ty * s}px) rotate(${rotation}deg)`,
                    clipPath: `polygon(0 0, 100% 0, calc(100% - ${fw * s}px) 100%, ${fw * s}px 100%)`,
                }} />
            );
        }

        const optimized = points.reduce((acc, p) => {
            if (acc.length === 0) return [p];
            const last = acc[acc.length - 1];
            if (Math.abs(p.x - last.x) < 1.0 && acc.length > 1) return acc;
            return [...acc, p];
        }, [] as {x: number, y: number}[]).sort((a, b) => a.x - b.x);
        
        const woodColor = '#ae8d55'; 
        
        return (
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                transformOrigin: '0 0',
                transform: `translate(${tx * s}px, ${ty * s}px) rotate(${rotation}deg)`,
                transformStyle: 'preserve-3d',
            }}>
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
                            width: `${fullWidth + 2}px`, 
                            height: `${sliceW * s + 0.8}px`, 
                            top: `${offsetFront * s - 0.4}px`,
                            left: `-1px`,
                            backgroundColor: woodColor, 
                            backgroundImage: `url(${processedTexture})`,
                            backgroundSize: `auto ${fw * s}px`,
                            backgroundPosition: `0 -${offsetFront * s}px`,
                            transform: `translateZ(-${sliceZ * s}px)`,
                            transformStyle: 'preserve-3d',
                            clipPath: `polygon(
                                ${offsetFront * s}px 0, 
                                ${fullWidth - offsetFront * s}px 0, 
                                ${fullWidth - (offsetFront + sliceW) * s}px 100%, 
                                ${(offsetFront + sliceW) * s}px 100%
                            )`,
                            filter: `brightness(${1 - (pNext.y / 800)})`, 
                        }} />
                    );
                })}
            </div>
        );
    };

    const sideStyle = (w: number, h: number, brightness = 0.8) => ({
        width: `${w * s}px`,
        height: `${h * s}px`,
        backgroundImage: `url(${processedTexture})`,
        backgroundSize: '100% 100%',
        position: 'absolute' as const,
        filter: `brightness(${brightness})`,
    });

    return (
        // Container isolado (renderiza fora da tela mas visível pro canvas)
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
            <div 
                ref={containerRef} 
                style={{ 
                    width: '600px', 
                    height: '600px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    perspective: '2000px' 
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        width: `${legLength * s}px`,
                        height: `${legLength * s}px`,
                        // Ângulo fotográfico estilo "quina" (V apontando para baixo)
                        transform: 'rotateX(55deg) rotateZ(-135deg)',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Sombra de chão preenchendo o V */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: `${legLength * s}px`, height: `${fw * s}px`,
                        backgroundColor: 'black',
                        transform: `translateZ(-${fd * s}px)`,
                        filter: 'blur(20px)', opacity: 0.4,
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: `${fw * s}px`, height: `${legLength * s}px`,
                        backgroundColor: 'black',
                        transform: `translateZ(-${fd * s}px)`,
                        filter: 'blur(20px)', opacity: 0.4,
                    }} />
                    
                    {/* CORPO DA QUINA EM 3D */}
                    {/* Topo Externo L stick */}
                    <div style={{
                        ...sideStyle(legLength, fd, 0.95),
                        top: 0, left: 0,
                        transformOrigin: 'top',
                        transform: 'rotateX(-90deg)',
                    }} />
                    {/* Esquerda Externa L stick */}
                    <div style={{
                        ...sideStyle(fd, legLength, 0.85),
                        top: 0, left: 0,
                        transformOrigin: 'left',
                        transform: 'rotateY(90deg)',
                    }} />

                    {/* Frentes (extrusões) */}
                    <ProfileSticks length={legLength} direction="to bottom" rotation={0} tx={0} ty={0} />
                    <ProfileSticks length={legLength} direction="to bottom" rotation={270} tx={0} ty={legLength} />
                    
                    {/* Os pedaços cortados (a mitra e pontas secas) não precisam ser super detalhados para o PNG se a câmera não ver de baixo, mas uma tampa simples ajuda */}
                </div>
            </div>
        </div>
    );
});

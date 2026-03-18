import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { toPng } from 'html-to-image';

export interface FrameElbowGeneratorProps {
    frameWidth: number;
    frameDepth: number;
    rabbetDepth: number;
    profileType: string;
    profileSVG?: string;
    textureUrl: string;
    invertTexture?: boolean;
}

export interface FrameElbowGeneratorRef {
    generateImage: () => Promise<string | null>;
}

export const FrameElbowGenerator = forwardRef<FrameElbowGeneratorRef, FrameElbowGeneratorProps>(({
    frameWidth, frameDepth, profileType, profileSVG, textureUrl, invertTexture
}, ref) => {
    const [processedTexture, setProcessedTexture] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
    const s = 25; 
    const legLength = 18; 

    useEffect(() => {
        if (!textureUrl) return;
        setProcessedTexture(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
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
                const dataUrl = await toPng(containerRef.current, {
                    cacheBust: true,
                    pixelRatio: 2,
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
        length, direction, rotation, tx, ty, miterEnd = 'both'
    }: { 
        length: number, 
        direction: string,
        rotation: number,
        tx: number,
        ty: number,
        miterEnd?: 'left' | 'right' | 'both'
    }) => {
        const points = profileType === 'curvo' && profileSVG ? parseProfilePoints(profileSVG) : [];
        
        const getClipPath = (offset: number, sliceWidth: number) => {
            const lt = miterEnd === 'left' || miterEnd === 'both' ? `${offset * s}px` : '0px';
            const lb = miterEnd === 'left' || miterEnd === 'both' ? `${(offset + sliceWidth) * s}px` : '0px';
            const rt = miterEnd === 'right' || miterEnd === 'both' ? `calc(100% - ${offset * s}px)` : '100%';
            const rb = miterEnd === 'right' || miterEnd === 'both' ? `calc(100% - ${(offset + sliceWidth) * s}px)` : '100%';
            return `polygon(${lt} 0px, ${rt} 0px, ${rb} 100%, ${lb} 100%)`;
        };

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
                    clipPath: getClipPath(0, fw),
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
                    clipPath: getClipPath(0, fw),
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
                            clipPath: getClipPath(offsetFront, sliceW),
                            filter: `brightness(${1 - (pNext.y / 400)})`, 
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

    const woodColor = '#d9b684'; // Raw wood color

    return (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
            <div 
                ref={containerRef} 
                style={{ 
                    width: '800px', 
                    height: '800px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    perspective: '2500px' 
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        width: `${legLength * s}px`,
                        height: `${legLength * s}px`,
                        // Ângulo fotográfico Chevron: inclina pra mostrar o tampo (60deg), roda 45deg p/ ficar em V ^ para cima
                        transform: 'translateY(-50px) rotateX(60deg) rotateZ(45deg)',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Sombras base na mesa do "Chevron" */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: `${legLength * s}px`, height: `${fw * s}px`,
                        backgroundColor: 'black',
                        transform: `translateZ(-${fd * s + 8}px)`,
                        filter: 'blur(30px)', opacity: 0.6,
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: `${fw * s}px`, height: `${legLength * s}px`,
                        backgroundColor: 'black',
                        transform: `translateZ(-${fd * s + 8}px)`,
                        filter: 'blur(30px)', opacity: 0.6,
                    }} />
                    
                    {/* Lados externos da moldura (Madeira) */}
                    <div style={{
                        ...sideStyle(legLength, fd, 0.95),
                        top: 0, left: 0,
                        transformOrigin: 'top',
                        transform: 'rotateX(-90deg)',
                    }} />
                    <div style={{
                        ...sideStyle(fd, legLength, 0.85),
                        top: 0, left: 0,
                        transformOrigin: 'left',
                        transform: 'rotateY(90deg)',
                    }} />

                    {/* Extrusões das tiras com as texturas */}
                    <ProfileSticks length={legLength} direction="to bottom" rotation={0} tx={0} ty={0} miterEnd="left" />
                    <ProfileSticks length={legLength} direction="to bottom" rotation={270} tx={0} ty={legLength} miterEnd="right" />
                    
                    {/* Seções de Corte mostrando o Perfil Técnico */}
                    {/* Corte 1: Perna Direita (Right leg end) */}
                    <div style={{
                        position: 'absolute',
                        left: `${legLength * s}px`,
                        top: 0,
                        width: `${fd * s}px`, 
                        height: `${fw * s}px`,
                        backgroundColor: woodColor, 
                        // Aplicando o clip path na tampa lateral, precisa estar orientado corretamente
                        clipPath: profileType === 'curvo' && profileSVG ? profileSVG.replace(/(\d+)%/g, (_, num) => {
                           // Invertendo X e Y no clip-path dependendo do eixo da "face"
                           return `${num}%`; 
                        }) : undefined,
                        transformOrigin: 'left',
                        transform: 'rotateY(90deg) rotateZ(90deg) rotateX(180deg)',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', 
                        backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.1) 100%)`
                    }}>
                        <div style={{width: '100%', height: '100%', backgroundColor: 'transparent', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)'}} />
                    </div>

                    {/* Corte 2: Perna Inferior (Bottom leg end) */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: `${legLength * s}px`,
                        width: `${fw * s}px`,
                        height: `${fd * s}px`,
                        backgroundColor: woodColor,
                        clipPath: profileType === 'curvo' && profileSVG ? profileSVG : undefined,
                        transformOrigin: 'top',
                        transform: 'rotateX(-90deg) rotateZ(180deg) rotateY(180deg)',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                        backgroundImage: `linear-gradient(-45deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.1) 100%)`
                    }}>
                        <div style={{width: '100%', height: '100%', backgroundColor: 'transparent', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)'}} />
                    </div>
                </div>
            </div>
        </div>
    );
});

import React from 'react';
import { FrameData } from '../../store/useSimulatorStore';

interface FrameChevronProps {
    frame: FrameData;
    size?: number; // Base size in pixels
    className?: string;
}

/**
 * A dynamic CSS-based 3D-like corner visual for frames.
 * Based on the logic from FrameElbowGenerator but optimized for UI display.
 */
export const FrameChevron: React.FC<FrameChevronProps> = ({ frame, size = 160, className = "" }) => {
    const { frameWidth, frameDepth, profileSVG, textureUrl } = frame;
    
    // Scale factor to fit the visual in the box
    // s is the unit size. In FrameElbowGenerator it was 25. 
    // Here we scale it based on the 'size' prop.
    const s = size / 20; 
    const fw = frameWidth;
    const fd = frameDepth;
    const legLength = 15; // length of each leg in units

    const woodColor = '#d9b684'; // Raw wood color

    const parseProfilePoints = (poly: string) => {
        const pts = poly.match(/[\d.]+%[\s,]+[\d.]+%/g);
        if (!pts) return [];
        return pts.map(p => {
            const clean = p.replace(/%/g, '').replace(/,/g, ' ').trim();
            const [x, y] = clean.split(/\s+/).map(v => parseFloat(v));
            return { x, y };
        });
    };

    const points = profileSVG ? parseProfilePoints(profileSVG) : [];

    const getClipPath = (offset: number, sliceWidth: number, miterEnd: 'left' | 'right' | 'both' = 'both') => {
        const lt = miterEnd === 'left' || miterEnd === 'both' ? `${offset * s}px` : '0px';
        const lb = miterEnd === 'left' || miterEnd === 'both' ? `${(offset + sliceWidth) * s}px` : '0px';
        const rt = miterEnd === 'right' || miterEnd === 'both' ? `calc(100% - ${offset * s}px)` : '100%';
        const rb = miterEnd === 'right' || miterEnd === 'both' ? `calc(100% - ${(offset + sliceWidth) * s}px)` : '100%';
        return `polygon(${lt} 0px, ${rt} 0px, ${rb} 100%, ${lb} 100%)`;
    };

    // Style for the top surfaces
    const optimized = points.length > 0 ? points.reduce((acc, p) => {
        if (acc.length === 0) return [p];
        const last = acc[acc.length - 1];
        if (Math.abs(p.x - last.x) < 1.0 && acc.length > 1) return acc;
        return [...acc, p];
    }, [] as {x: number, y: number}[]).sort((a, b) => a.x - b.x) : [];

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
        if (optimized.length < 2) {
            // Simplified box profile
            return (
                <div style={{
                    position: 'absolute',
                    width: `${length * s}px`,
                    height: `${fw * s}px`,
                    backgroundImage: `linear-gradient(${direction}, rgba(0,0,0,0.15), rgba(0,0,0,0.3)), url(${textureUrl})`,
                    backgroundSize: `auto ${fw * s}px`,
                    top: 0, left: 0,
                    transformOrigin: '0 0',
                    transform: `translate(${tx * s}px, ${ty * s}px) rotate(${rotation}deg)`,
                    clipPath: getClipPath(0, fw, miterEnd),
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
                }} />
            );
        }

        return (
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                transformOrigin: '0 0',
                transform: `translate(${tx * s}px, ${ty * s}px) rotate(${rotation}deg)`,
                transformStyle: 'preserve-3d',
            }}>
                {optimized.map((p, i) => {
                    if (i === optimized.length - 1) return null;
                    const pNext = optimized[i+1];
                    const sliceW = ((pNext.x - p.x) / 100) * fw;
                    const sliceZ = ((p.y + pNext.y) / 200) * fd;
                    const offsetFront = (p.x / 100) * fw;
                    
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            width: `${length * s + 1}px`, 
                            height: `${sliceW * s + 0.5}px`, 
                            top: `${offsetFront * s - 0.25}px`,
                            left: 0,
                            backgroundImage: `url(${textureUrl})`,
                            backgroundSize: `auto ${fw * s}px`,
                            backgroundPosition: `0 -${offsetFront * s}px`,
                            transform: `translateZ(-${sliceZ * s}px)`,
                            transformStyle: 'preserve-3d',
                            clipPath: getClipPath(offsetFront, sliceW, miterEnd),
                            filter: `brightness(${1.1 - (pNext.y / 400)})`, // Basic shading
                        }} />
                    );
                })}
            </div>
        );
    };

    return (
        <div 
            className={`relative flex items-center justify-center pointer-events-none ${className}`}
            style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                perspective: '1500px' 
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: `${legLength * s}px`,
                    height: `${legLength * s}px`,
                    // V-shape pointing up
                    transform: 'rotateX(55deg) rotateZ(45deg) translateY(-20px)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* External Sides (Sides of the wood) */}
                <div style={{
                    width: `${legLength * s}px`,
                    height: `${fd * s}px`,
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${textureUrl})`,
                    backgroundSize: '100% 100%',
                    position: 'absolute',
                    top: 0, left: 0,
                    transformOrigin: 'top',
                    transform: 'rotateX(-90deg)',
                }} />
                <div style={{
                    width: `${fd * s}px`,
                    height: `${legLength * s}px`,
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${textureUrl})`,
                    backgroundSize: '100% 100%',
                    position: 'absolute',
                    top: 0, left: 0,
                    transformOrigin: 'left',
                    transform: 'rotateY(90deg)',
                }} />

                {/* Top Surfaces */}
                <ProfileSticks length={legLength} direction="to bottom" rotation={0} tx={0} ty={0} miterEnd="left" />
                <ProfileSticks length={legLength} direction="to bottom" rotation={270} tx={0} ty={legLength} miterEnd="right" />
                
                {/* Cross-section Cut visuals */}
                <div style={{
                    position: 'absolute',
                    left: `${legLength * s}px`, top: 0,
                    width: `${fd * s}px`, height: `${fw * s}px`,
                    backgroundColor: woodColor,
                    clipPath: profileSVG || 'none',
                    transformOrigin: 'left',
                    transform: 'rotateY(90deg) rotateZ(90deg) rotateX(180deg)',
                    backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.1) 100%)`
                }} />
                <div style={{
                    position: 'absolute',
                    left: 0, top: `${legLength * s}px`,
                    width: `${fw * s}px`, height: `${fd * s}px`,
                    backgroundColor: woodColor,
                    clipPath: profileSVG || 'none',
                    transformOrigin: 'top',
                    transform: 'rotateX(-90deg) rotateZ(180deg) rotateY(180deg)',
                    backgroundImage: `linear-gradient(-45deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.1) 100%)`
                }} />
            </div>
            
            {/* Ground Shadow */}
            <div style={{
                position: 'absolute',
                top: '55%', left: '50%',
                width: '120%', height: '80%',
                backgroundColor: 'rgba(0,0,0,0.15)',
                filter: 'blur(30px)',
                transform: 'translate(-50%, -50%) rotateX(80deg)',
                borderRadius: '100%',
                zIndex: -1
            }} />
        </div>
    );
};

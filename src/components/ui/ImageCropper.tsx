import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Check, X, Move, Maximize2 } from 'lucide-react';

interface ImageCropperProps {
    imageUrl: string;
    targetAspectRatio?: number; // width / height
    onCrop: (croppedImageUrl: string, dimensions: { width: number; height: number }) => void;
    onClose: () => void;
}

export function ImageCropper({ imageUrl, targetAspectRatio, onCrop, onClose }: ImageCropperProps) {
    const [selection, setSelection] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [dragging, setDragging] = useState<{ type: 'move' | 'resize', startX: number, startY: number, startSelection: typeof selection } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Initial selection: 80% of the image, respecting targetAspectRatio if provided
    useEffect(() => {
        if (imageLoaded && imageRef.current) {
            const { offsetWidth: imgW, offsetHeight: imgH } = imageRef.current;

            let selectionW, selectionH;

            if (targetAspectRatio) {
                // Try choosing max width first
                selectionW = imgW * 0.8;
                selectionH = selectionW / targetAspectRatio;

                // If height exceeds image, scale based on height instead
                if (selectionH > imgH * 0.8) {
                    selectionH = imgH * 0.8;
                    selectionW = selectionH * targetAspectRatio;
                }
            } else {
                const size = Math.min(imgW, imgH) * 0.8;
                selectionW = size;
                selectionH = size;
            }

            setSelection({
                x: (imgW - selectionW) / 2,
                y: (imgH - selectionH) / 2,
                width: selectionW,
                height: selectionH
            });
        }
    }, [imageLoaded, targetAspectRatio]);

    const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
        e.stopPropagation();
        setDragging({
            type,
            startX: e.clientX,
            startY: e.clientY,
            startSelection: { ...selection }
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging || !imageRef.current) return;

            const deltaX = e.clientX - dragging.startX;
            const deltaY = e.clientY - dragging.startY;
            const img = imageRef.current;

            if (dragging.type === 'move') {
                const newX = Math.max(0, Math.min(img.offsetWidth - dragging.startSelection.width, dragging.startSelection.x + deltaX));
                const newY = Math.max(0, Math.min(img.offsetHeight - dragging.startSelection.height, dragging.startSelection.y + deltaY));
                setSelection(prev => ({ ...prev, x: newX, y: newY }));
            } else if (dragging.type === 'resize') {
                let newW, newH;

                if (targetAspectRatio) {
                    // Force aspect ratio during resize
                    newW = Math.max(50, dragging.startSelection.width + deltaX);
                    newH = newW / targetAspectRatio;

                    // Check boundaries
                    if (dragging.startSelection.x + newW > img.offsetWidth) {
                        newW = img.offsetWidth - dragging.startSelection.x;
                        newH = newW / targetAspectRatio;
                    }
                    if (dragging.startSelection.y + newH > img.offsetHeight) {
                        newH = img.offsetHeight - dragging.startSelection.y;
                        newW = newH * targetAspectRatio;
                    }
                } else {
                    newW = Math.max(50, Math.min(img.offsetWidth - dragging.startSelection.x, dragging.startSelection.width + deltaX));
                    newH = Math.max(50, Math.min(img.offsetHeight - dragging.startSelection.y, dragging.startSelection.height + deltaY));
                }

                setSelection(prev => ({ ...prev, width: newW, height: newH }));
            }
        };

        const handleMouseUp = () => setDragging(null);

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);

    const executeCrop = () => {
        if (!imageRef.current) return;

        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = img.naturalWidth / img.offsetWidth;
        const scaleY = img.naturalHeight / img.offsetHeight;

        canvas.width = selection.width * scaleX;
        canvas.height = selection.height * scaleY;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(
                img,
                selection.x * scaleX,
                selection.y * scaleY,
                selection.width * scaleX,
                selection.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height
            );
            onCrop(canvas.toDataURL('image/jpeg', 0.9), { width: canvas.width, height: canvas.height });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                <header className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-white font-semibold tracking-tight uppercase text-sm">Ajustar Corte</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Fechar ferramenta de corte">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 relative overflow-hidden bg-black/20 flex items-center justify-center p-8 min-h-[400px]">
                    <div className="relative inline-block shadow-2xl" ref={containerRef}>
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Crop target"
                            className="max-h-[60vh] max-w-full block select-none"
                            onLoad={() => setImageLoaded(true)}
                        />

                        {/* Overlay darkening outside selection */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full bg-black/50" style={{ height: `${selection.y}px` }} />
                            <div className="absolute bottom-0 left-0 w-full bg-black/50" style={{ height: `calc(100% - ${selection.y + selection.height}px)` }} />
                            <div className="absolute left-0 bg-black/50" style={{ top: `${selection.y}px`, height: `${selection.height}px`, width: `${selection.x}px` }} />
                            <div className="absolute right-0 bg-black/50" style={{ top: `${selection.y}px`, height: `${selection.height}px`, width: `calc(100% - ${selection.x + selection.width}px)` }} />
                        </div>

                        {/* Selection area */}
                        <div
                            className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move group"
                            style={{
                                top: `${selection.y}px`,
                                left: `${selection.x}px`,
                                width: `${selection.width}px`,
                                height: `${selection.height}px`
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'move')}
                        >
                            {/* Grid lines */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
                                <div className="border-r border-b border-white/50" />
                                <div className="border-r border-b border-white/50" />
                                <div className="border-b border-white/50" />
                                <div className="border-r border-b border-white/50" />
                                <div className="border-r border-b border-white/50" />
                                <div className="border-b border-white/50" />
                                <div className="border-r border-white/50" />
                                <div className="border-r border-white/50" />
                            </div>

                            {/* Resize Handle */}
                            <div
                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-zinc-900 cursor-se-resize flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                onMouseDown={(e) => handleMouseDown(e, 'resize')}
                            >
                                <Maximize2 className="w-3 h-3 text-zinc-900 rotate-90" />
                            </div>

                            {/* Center Icon */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity">
                                <Move className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between gap-4">
                    <p className="text-zinc-400 text-xs italic">
                        DICA: Arraste para mover e use o círculo no canto para ajustar o tamanho.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={executeCrop}
                            className="px-8 py-2 rounded-full bg-white text-black text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            <Check className="w-4 h-4" />
                            CONFIRMAR CORTE
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

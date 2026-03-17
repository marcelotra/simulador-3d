import React, { useState, useRef, useEffect } from 'react';
import { X, Check, MousePointer2, Eraser, Undo2 } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

interface PathEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (svgPath: string) => void;
    initialReferenceImage?: string;
}

export function PathEditorModal({ isOpen, onClose, onSave, initialReferenceImage }: PathEditorModalProps) {
    const [points, setPoints] = useState<Point[]>([]);
    const [referenceImage, setReferenceImage] = useState<string | null>(initialReferenceImage || null);
    const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
    const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setPoints([]);
            setReferenceImage(initialReferenceImage || null);
        }
    }, [isOpen, initialReferenceImage]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar linhas
        if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            // Ligar último ao primeiro se tivermos 3+ pontos
            if (points.length >= 3) {
                ctx.lineTo(points[0].x, points[0].y);
            }
            ctx.strokeStyle = '#ef4444'; // Red-500
            ctx.lineWidth = 2;
            ctx.stroke();

            // Prenchimento pŕevio
            if (points.length >= 3) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                ctx.fill();
            }

            // Desenhar pontos
            points.forEach((p, i) => {
                ctx.beginPath();
                const isHovered = i === hoveredPointIndex || i === draggingPointIndex;
                ctx.arc(p.x, p.y, isHovered ? 7 : 5, 0, Math.PI * 2);
                ctx.fillStyle = i === 0 ? '#22c55e' : (isHovered ? '#f97316' : '#ef4444'); // Laranja se houver interação, Verde/Vermelho padrão
                ctx.fill();
                if (isHovered) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }
    }, [points, isOpen, hoveredPointIndex, draggingPointIndex]);

    if (!isOpen) return null;

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        
        // Calculate actual size of the canvas drawing area considering object-fit: contain
        const imgRatio = canvas.width / canvas.height;
        const rectRatio = rect.width / rect.height;

        let actualWidth, actualHeight;
        if (rectRatio > imgRatio) {
            actualHeight = rect.height;
            actualWidth = rect.height * imgRatio;
        } else {
            actualWidth = rect.width;
            actualHeight = rect.width / imgRatio;
        }

        const offsetX = (rect.width - actualWidth) / 2;
        const offsetY = (rect.height - actualHeight) / 2;

        const x = (e.clientX - rect.left - offsetX) * (canvas.width / actualWidth);
        const y = (e.clientY - rect.top - offsetY) * (canvas.height / actualHeight);

        return { x, y };
    };

    const getPointAtCoordinates = (x: number, y: number): number | null => {
        const threshold = 12; // Reduzido para permitir pontos próximos
        // Check backwards to select the topmost point if they overlap
        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
            const distance = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
            if (distance <= threshold) return i;
        }
        return null;
    };

    const getSegmentAtCoordinates = (x: number, y: number): number | null => {
        if (points.length < 2) return null;
        
        const threshold = 10; // Reduzido para permitir precisão milimétrica nas curvas
        let closestDist = Infinity;
        let closestIndex = null;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const nextIndex = (i + 1) % points.length;
            // Se não fechamos o polígono e tem apenas < 3 pontos, não insere no "segmento final" invisível
            if (points.length < 3 && nextIndex === 0) continue; 
            
            const p2 = points[nextIndex];
            
            const l2 = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
            let dist;
            if (l2 === 0) {
                dist = Math.sqrt(Math.pow(x - p1.x, 2) + Math.pow(y - p1.y, 2));
            } else {
                let t = ((x - p1.x) * (p2.x - p1.x) + (y - p1.y) * (p2.y - p1.y)) / l2;
                t = Math.max(0, Math.min(1, t));
                const projX = p1.x + t * (p2.x - p1.x);
                const projY = p1.y + t * (p2.y - p1.y);
                dist = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
            }

            if (dist < threshold && dist < closestDist) {
                closestDist = dist;
                closestIndex = i;
            }
        }
        return closestIndex;
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCoordinates(e);
        const clickedPointIndex = getPointAtCoordinates(x, y);

        if (clickedPointIndex !== null) {
            // Iniciou click em cima de um ponto = começar a arrastar
            setDraggingPointIndex(clickedPointIndex);
        } else {
            const clickedSegmentIndex = getSegmentAtCoordinates(x, y);
            if (clickedSegmentIndex !== null) {
                // Inserir novo ponto no meio da linha
                const newPoints = [...points];
                newPoints.splice(clickedSegmentIndex + 1, 0, { x, y });
                setPoints(newPoints);
                setDraggingPointIndex(clickedSegmentIndex + 1); // Já arrastando o adicionado
                setHoveredPointIndex(clickedSegmentIndex + 1);
            } else {
                // Clique no vazio = criar novo ponto
                setPoints([...points, { x, y }]);
            }
        }
    };

    const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCoordinates(e);
        const clickedPointIndex = getPointAtCoordinates(x, y);
        if (clickedPointIndex !== null && points.length > 0) {
            const newPoints = [...points];
            newPoints.splice(clickedPointIndex, 1);
            setPoints(newPoints);
            setDraggingPointIndex(null);
            setHoveredPointIndex(null);
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCoordinates(e);

        if (draggingPointIndex !== null) {
            // Está arrastando
            const newPoints = [...points];
            newPoints[draggingPointIndex] = { x, y };
            setPoints(newPoints);
        } else {
            // Apenas moveu o mouse. Vamos atualizar o hover
            const hoveredPoint = getPointAtCoordinates(x, y);
            if (hoveredPoint !== hoveredPointIndex) {
                 setHoveredPointIndex(hoveredPoint);
            }
        }
    };

    const handleCanvasMouseUp = () => {
        setDraggingPointIndex(null);
    };

    const handleCanvasMouseLeave = () => {
        setDraggingPointIndex(null);
        setHoveredPointIndex(null);
    };

    const handleUndo = () => {
        if (points.length > 0) {
            setPoints(points.slice(0, -1));
        }
    };

    const handleClear = () => {
        setPoints([]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setReferenceImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (points.length < 3) {
            alert('Por favor, desenhe pelo menos 3 pontos para formar uma forma fechada.');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Converter pontos reais do canvas para viewBox %
        // Vamos normalizar os pontos para um viewBox de 0 a 100
        let minX = Math.min(...points.map(p => p.x));
        let maxX = Math.max(...points.map(p => p.x));
        let minY = Math.min(...points.map(p => p.y));
        let maxY = Math.max(...points.map(p => p.y));

        const width = maxX - minX;
        const height = maxY - minY;

        // Gerar polygon em porcentagem baseado SOMENTE no bounding box do desenho e não no canvas todo
        // Para que CSS clip-path responda perfeitamente.
        const polygonPoints = points.map(p => {
            const px = ((p.x - minX) / width) * 100;
            const py = ((p.y - minY) / height) * 100;
            return `${px.toFixed(2)}% ${py.toFixed(2)}%`;
        });

        const cssPolygon = `polygon(${polygonPoints.join(', ')})`;
        
        onSave(cssPolygon);
        onClose();
    };

    const canvasCursorClass = draggingPointIndex !== null 
        ? 'cursor-grabbing' 
        : (hoveredPointIndex !== null ? 'cursor-grab' : 'cursor-crosshair');

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">Extrator de Molde Técnico</h2>
                        <p className="text-xs text-zinc-500">Desenhe os vértices da vista lateral da sua moldura sob a planta de engenharia. E arraste os pontos se precisar ajustar!</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors" title="Fechar" aria-label="Fechar">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 p-6 flex flex-col overflow-hidden bg-zinc-50">
                    {/* Barra de Ferramentas Interna */}
                    <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <label className="flex items-center px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 cursor-pointer transition-colors">
                                <span className="mr-2 text-lg">📸</span>
                                Enviar Foto da Planta
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                            {referenceImage && (
                                <button onClick={() => setReferenceImage(null)} className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
                                    Remover Fundo
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 border-l border-zinc-200 pl-4">
                            <button onClick={handleUndo} disabled={points.length === 0} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Desfazer Último Ponto">
                                <Undo2 className="w-4 h-4" />
                            </button>
                            <button onClick={handleClear} disabled={points.length === 0} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Apagar Tudo">
                                <Eraser className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="text-[11px] text-zinc-500 mb-2 flex items-center">
                        <MousePointer2 className="w-3 h-3 mr-1" />
                        <strong>Dica:</strong> Para curvar linhas: clique no meio do traço e arraste um novo ponto! (Duplo clique para remover um ponto).
                    </div>

                    <div ref={containerRef} className="flex-1 rounded-xl border-2 border-dashed border-zinc-300 bg-white relative overflow-hidden flex items-center justify-center group min-h-[500px]">
                        {!referenceImage && points.length === 0 && (
                            <div className="absolute flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
                                <p className="mb-2 text-sm font-medium">Nenhuma planta técnica selecionada.</p>
                                <p className="text-xs">Você pode desenhar no vácuo se quiser, mas uma foto de fundo ajuda muito!</p>
                            </div>
                        )}
                        
                        {referenceImage ? (
                            <img 
                                src={referenceImage} 
                                alt="Reference" 
                                className="absolute inset-0 w-full h-full object-contain opacity-50 select-none pointer-events-none" 
                                onLoad={(e) => {
                                    // Make canvas match image size to make drawing accurate
                                    const img = e.target as HTMLImageElement;
                                    const canvas = canvasRef.current;
                                    if (canvas) {
                                        canvas.width = img.naturalWidth || 800;
                                        canvas.height = img.naturalHeight || 600;
                                        // Clear after resize
                                        setPoints([...points]); 
                                    }
                                }}
                            />
                        ) : (
                             // Default empty canvas if no image
                             <canvas 
                                ref={canvasRef} 
                                width={800} 
                                height={600} 
                                className={`absolute inset-0 w-full h-full z-10 ${canvasCursorClass}`} 
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseLeave}
                                onDoubleClick={handleCanvasDoubleClick}
                             />
                        )}

                        {referenceImage && (
                            <canvas 
                                ref={canvasRef}
                                className={`absolute inset-0 w-full h-full z-10 object-contain ${canvasCursorClass}`} 
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseLeave}
                                onDoubleClick={handleCanvasDoubleClick}
                            />
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between rounded-b-2xl">
                    <span className="text-xs text-zinc-500 font-medium">{points.length} pontos desenhados</span>
                    <button 
                        onClick={handleSave}
                        className="flex items-center px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10 active:scale-[0.98]"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Finalizar Extração
                    </button>
                </div>
            </div>
        </div>
    );
}

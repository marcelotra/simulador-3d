import { Upload, X, Scissors, ChevronRight, Info, ZoomIn } from 'lucide-react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { calculatePrice } from '../../utils/calculations';
import { ImageCropper } from './ImageCropper';
import { useState, useEffect, useRef } from 'react';
import UTIF from 'utif';
import { SplitSettings } from './SplitSettings';
import { FrameChevron } from './FrameChevron';
import { SideMenu } from './SideMenu';
import { CartModal } from './CartModal';

const GLASS_OPTIONS = [
    { id: 'none', label: 'Sem Vidro', desc: 'Sem proteção' },
    { id: 'standard', label: 'Vidro Comum', desc: '8% reflexo' },
    { id: 'anti-reflective', label: 'ArtGlass', desc: 'Antirreflexo' },
] as const;

const PASSE_COLORS = ['#ffffff', '#f5f0e8', '#e8e0d0', '#c8b89a', '#1a1a1a'];

export const SectionTitle = ({ title, tooltip, step }: { title: string, tooltip?: string, step?: number }) => {
    const displayTitle = step ? `Passo ${step} • ${title}` : title;
    
    if (!tooltip) {
        return <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{displayTitle}</p>;
    }

    return (
        <div className="group relative inline-block mb-3">
            <div className="flex items-center gap-1.5 cursor-help">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">{displayTitle}</p>
                <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            </div>
            
            <div className="absolute left-0 top-full mt-2 w-64 p-2.5 bg-zinc-900 text-white text-[10px] whitespace-normal rounded-lg shadow-xl opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50 font-medium tracking-wide leading-relaxed">
                {tooltip}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-zinc-900 rotate-45"></div>
            </div>
        </div>
    );
};

export function Configurator() {
    const store = useSimulatorStore();
    const price = calculatePrice(store as any);

    const [activeStep, setActiveStep] = useState<'none' | 'dimensions' | 'frame' | 'passepartout' | 'glass' | 'paper'>('none');
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isCropping, setIsCropping] = useState(false);

    // Local dimension state for controlled inputs
    const [localWidth, setLocalWidth] = useState(String(store.width));
    const [localHeight, setLocalHeight] = useState(String(store.height));
    const [dimEdited, setDimEdited] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
    const lastProcessedImage = useRef<string | null>(null);
    
    // Auto-size to 100 DPI on image upload
    useEffect(() => {
        if (store.imagePixels && store.originalImage && store.originalImage !== lastProcessedImage.current) {
            const pxW = store.imagePixels.width;
            const pxH = store.imagePixels.height;
            const isLandscape = pxW >= pxH;
            const longestSidePx = isLandscape ? pxW : pxH;
            
            // Max size for 100 DPI
            const maxLongestSideCm = Math.round((longestSidePx * 2.54) / 100);
            const ratio = (isLandscape ? pxH : pxW) / longestSidePx;
            
            const w = isLandscape ? maxLongestSideCm : Math.round(maxLongestSideCm * ratio);
            const h = isLandscape ? Math.round(maxLongestSideCm * ratio) : maxLongestSideCm;
            
            store.setWidth(w);
            store.setHeight(h);
            setLocalWidth(String(w));
            setLocalHeight(String(h));
            
            lastProcessedImage.current = store.originalImage;
        }
    }, [store.imagePixels, store.originalImage, store.setWidth, store.setHeight]);


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const isTiff = file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff');

        if (isTiff) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const buffer = event.target?.result as ArrayBuffer;
                const ifds = UTIF.decode(buffer);
                UTIF.decodeImage(buffer, ifds[0]);
                const rgba = UTIF.toRGBA8(ifds[0]);
                const { width, height } = ifds[0] as { width: number; height: number };
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const imageData = ctx.createImageData(width, height);
                    imageData.data.set(rgba);
                    ctx.putImageData(imageData, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    store.setUserImage(dataUrl);
                    store.setOriginalImage(dataUrl);
                    store.setImagePixels({ width, height });
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                store.setUserImage(result);
                store.setOriginalImage(result);
                const img = new Image();
                img.onload = () => store.setImagePixels({ width: img.naturalWidth, height: img.naturalHeight });
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        store.setUserImage(null);
        store.setOriginalImage(null);
        store.setImagePixels(null);
    };

    const handleCropComplete = (croppedUrl: string, pixels: { width: number; height: number }) => {
        store.setUserImage(croppedUrl);
        store.setImagePixels(pixels);
        setIsCropping(false);
    };

    const handleConfirmDimensions = () => {
        const w = parseFloat(localWidth);
        const h = parseFloat(localHeight);
        
        if (w > 0 && h > 0) {
            // Check if aspect ratio matches current image
            if (store.imagePixels) {
                const currentRatio = store.imagePixels.width / store.imagePixels.height;
                const newRatio = w / h;
                const ratioDiff = Math.abs(currentRatio - newRatio) / currentRatio;

                if (ratioDiff > 0.02) {
                    // Ratio mismatch - trigger cropper first
                    store.setWidth(w);
                    store.setHeight(h);
                    setIsCropping(true);
                    setDimEdited(false);
                    return;
                }
            } else {
                // No imagePixels yet (placeholder) - if ratio changed significantly from 40/60
                const currentRatio = 40 / 60;
                const newRatio = w / h;
                const ratioDiff = Math.abs(currentRatio - newRatio) / currentRatio;
                if (ratioDiff > 0.02) {
                    store.setWidth(w);
                    store.setHeight(h);
                    setIsCropping(true);
                    setDimEdited(false);
                    return;
                }
            }
            
            store.setWidth(w);
            store.setHeight(h);
            setDimEdited(false);
        }
    };

    const handleFinalize = () => {
        store.addToCart(price.total);
        // setIsCartModalOpen(true); // Temporarily disabling cart modal for direct checkout feel or fix later
        alert("Adicionado ao carrinho com sucesso!");
    };

    const handleAddAnother = () => {
        store.resetConfiguration();
        setLocalWidth('40');
        setLocalHeight('60');
        setIsCartModalOpen(false);
    };

    const selectedPaper = store.availablePapers.find(p => p.id === store.printType);
    const selectedFrame = store.availableFrames.find(f => f.id === store.frameProfileId);


    // Remove duplicates to group similar sizes (e.g. 2 pieces of 30x40, 1 piece of 40x50)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-6 space-y-0 divide-y divide-zinc-100">

                {/* ── Upload da Arte ── */}
                <section className="py-4">
                    <SectionTitle step={1} title="Sua Arte" tooltip="Carregue sua imagem aqui. O sistema analisará a qualidade para sugerir os melhores tamanhos de impressão." />
                    {store.userImage ? (
                        <div className="space-y-2">
                            <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center aspect-video">
                                <img src={store.userImage} alt="Arte" className="max-h-full max-w-full object-contain" />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remover Imagem"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsCropping(true)}
                                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100 text-zinc-700 rounded-xl text-[10px] font-bold hover:bg-zinc-200 transition-all uppercase tracking-tight"
                            >
                                <Scissors className="w-3 h-3" />
                                Ajustar Enquadramento
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors group">
                            <Upload className="w-4 h-4 mb-1 text-zinc-400 group-hover:text-zinc-600" />
                            <p className="text-[10px] text-zinc-400 font-medium"><span className="font-bold text-zinc-600">Clique</span> ou arraste a arte</p>
                            <input type="file" accept=".jpg,.jpeg,.png,.tif,.tiff" className="hidden" onChange={handleImageUpload} />
                        </label>
                    )}
                </section>

                {/* ── PASSO 1: Tamanho da Imagem ── */}
                <section className="py-4 px-1">
                    <button 
                        onClick={() => setActiveStep('dimensions')}
                        className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-900 transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl border border-zinc-100 shadow-sm transition-transform group-hover:scale-105">
                                <ZoomIn className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <SectionTitle step={1} title="Tamanho da Imagem" />
                                <span className="text-lg font-black text-zinc-900 tracking-tight">{store.width} × {store.height} cm</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </button>
                </section>

                {/* ── Divisões (Quick Setting) ── */}
                <SplitSettings />

                {/* ── PASSO 2: Modalidade/Moldura ── */}
                <section className="py-4 px-1">
                    <button 
                        onClick={() => setActiveStep('frame')}
                        className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-900 transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-1 rounded-xl border border-zinc-100 shadow-sm transition-transform group-hover:scale-105 overflow-hidden w-12 h-12 flex items-center justify-center">
                                {store.hasFrame && selectedFrame ? (
                                    selectedFrame.previewUrl ? (
                                        <img src={selectedFrame.previewUrl} alt={selectedFrame.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FrameChevron frame={selectedFrame} size={40} />
                                    )
                                ) : (
                                    <X className="w-6 h-6 text-zinc-300" />
                                )}
                            </div>
                            <div>
                                <SectionTitle step={2} title="Moldura" />
                                <span className="text-lg font-black text-zinc-900 tracking-tight">
                                    {store.hasFrame ? selectedFrame?.name ?? 'Selecionar' : 'Sem Moldura'}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </button>
                </section>

                {/* ── PASSO 3: Passe-Partout ── */}
                {store.hasFrame && (
                    <section className="py-4 px-1">
                        <button 
                            onClick={() => setActiveStep('passepartout')}
                            className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-900 transition-all text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-12 h-12 rounded-xl border border-zinc-100 shadow-sm transition-transform group-hover:scale-105 flex items-center justify-center font-black text-[10px] text-zinc-400"
                                    style={{ backgroundColor: store.passepartoutWidth > 0 ? store.passepartoutColor : '#f4f4f5' }}
                                >
                                    {store.passepartoutWidth > 0 ? `${store.passepartoutWidth}cm` : 'ZERO'}
                                </div>
                                <div>
                                    <SectionTitle step={3} title="Passe-Partout" />
                                    <span className="text-lg font-black text-zinc-900 tracking-tight">
                                        {store.passepartoutWidth > 0 ? `${store.passepartoutWidth} cm - Margem` : 'Sem Passe-Partout'}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                        </button>
                    </section>
                )}

                {/* ── PASSO 4: Vidro ── */}
                {store.hasFrame && (
                    <section className="py-4 px-1">
                        <button 
                            onClick={() => setActiveStep('glass')}
                            className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-900 transition-all text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded-xl border border-zinc-100 shadow-sm transition-transform group-hover:scale-105 w-12 h-12 flex items-center justify-center">
                                    <Info className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <SectionTitle step={4} title="Proteção (Vidro)" />
                                    <span className="text-lg font-black text-zinc-900 tracking-tight">
                                        {GLASS_OPTIONS.find(g => g.id === store.glassType)?.label ?? 'Sem Vidro'}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                        </button>
                    </section>
                )}

                {/* ── PASSO 5: Impressão ── */}
                <section className="py-4 px-1">
                    <button
                        onClick={() => setActiveStep('paper')}
                        className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-900 transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-100 shadow-sm transition-transform group-hover:scale-105 bg-white flex items-center justify-center">
                                {selectedPaper?.imageUrl ? (
                                    <img src={selectedPaper.imageUrl} alt={selectedPaper.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-5 h-5 text-zinc-300" />
                                )}
                            </div>
                            <div>
                                <SectionTitle step={store.hasFrame ? 5 : 2} title="Impressão" />
                                <span className="text-lg font-black text-zinc-900 tracking-tight">{selectedPaper?.name ?? 'Selecionar Papel'}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </button>
                </section>

            </div>

            {/* ── Footer: Preço + Finalizar ── */}
            <div className="border-t border-zinc-100 pt-4 pb-2 bg-white">
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block">Valor Total</span>
                        <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                            R$ {price.total.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] text-zinc-400 font-bold block">{store.width}×{store.height} cm</span>
                        {store.quantity > 1 && (
                            <span className="text-[9px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{store.quantity}x</span>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleFinalize}
                    className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg uppercase tracking-widest text-xs"
                    title="Adicionar ao carrinho e finalizar"
                >
                    Finalizar Pedido
                </button>
            </div>

            {/* ── SIDE MENUS ── */}
            
            {/* 1. Dimensões */}
            <SideMenu 
                isOpen={activeStep === 'dimensions'} 
                onClose={() => setActiveStep('none')} 
                title="TAMANHO DA IMAGEM"
                price={price.total}
            >
                <div className="space-y-8">
                    {store.imagePixels ? (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Sugestões Proporcionais</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(() => {
                                    const pxW = store.imagePixels.width;
                                    const pxH = store.imagePixels.height;
                                    
                                    const isLandscape = pxW >= pxH;
                                    const longestSidePx = isLandscape ? pxW : pxH;
                                    const shortestSidePx = isLandscape ? pxH : pxW;
                                    const ratio = shortestSidePx / longestSidePx;
                                    
                                    // Max size for 100 DPI
                                    const maxLongestSideCm = (longestSidePx * 2.54) / 100;
                                    
                                    // Generate exactly 8 steps as divisions of the max size
                                    const steps = 8;
                                    const stepSize = maxLongestSideCm / steps;
                                    
                                    return Array.from({ length: steps }).map((_, i) => {
                                        const length = Math.round((i + 1) * stepSize);
                                        const w = isLandscape ? length : Math.round(length * ratio);
                                        const h = isLandscape ? Math.round(length * ratio) : length;
                                        const isSelected = Math.abs(store.width - w) < 1 && Math.abs(store.height - h) < 1;
                                        const isLimit = i === steps - 1;
                                        
                                        // Calculate DPI for this specific size
                                        const currentDpi = Math.round((longestSidePx * 2.54) / length);
                                        
                                        return (
                                            <button
                                                key={`${w}x${h}-${i}`}
                                                onClick={() => {
                                                    store.setWidth(w);
                                                    store.setHeight(h);
                                                    setLocalWidth(String(w));
                                                    setLocalHeight(String(h));
                                                }}
                                                className={`p-4 border-2 rounded-2xl text-center transition-all relative overflow-hidden ${
                                                    isSelected ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                                }`}
                                            >
                                                <span className="text-sm font-black block">{w} × {h}</span>
                                                <div className="flex items-center justify-center gap-1 opacity-60">
                                                    <span className="text-[9px] uppercase tracking-widest leading-none">cm</span>
                                                    <span className="text-[9px] border-l border-current pl-1 leading-none">{currentDpi} DPI</span>
                                                </div>
                                                {isLimit && (
                                                    <div className="absolute top-0 right-0 bg-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-bl shadow-sm text-white uppercase tracking-tighter">
                                                        Tamanho Máximo
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-zinc-100 rounded-2xl text-center bg-zinc-50/50">
                            <ZoomIn className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                Carregue sua arte para ver<br />sugestões de tamanho ideais
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Ajuste Manual</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-1">
                                <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Largura</label>
                                <input
                                    type="number"
                                    value={localWidth}
                                    title="Largura da imagem"
                                    onChange={e => { setLocalWidth(e.target.value); setDimEdited(true); }}
                                    className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl font-black text-xl focus:border-zinc-900 outline-none transition-all"
                                />
                            </div>
                            <div className="text-zinc-200 font-bold mt-6">×</div>
                            <div className="flex-1 space-y-1">
                                <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Altura</label>
                                <input
                                    type="number"
                                    value={localHeight}
                                    title="Altura da imagem"
                                    onChange={e => { setLocalHeight(e.target.value); setDimEdited(true); }}
                                    className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl font-black text-xl focus:border-zinc-900 outline-none transition-all"
                                />
                            </div>
                        </div>
                        {dimEdited && (
                            <button 
                                onClick={handleConfirmDimensions}
                                className="w-full mt-4 bg-zinc-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
                            >
                                Aplicar Medidas
                            </button>
                        )}
                    </div>
                </div>
            </SideMenu>

            {/* 2. Moldura */}
            <SideMenu 
                isOpen={activeStep === 'frame'} 
                onClose={() => setActiveStep('none')} 
                title="ESCOLHA SUA MOLDURA"
                price={price.total}
            >
                <div className="space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
                        {['all', 'Madeira', 'Preta', 'Branca', 'Dourada', 'Prata'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                    selectedCategory === cat ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                                }`}
                            >
                                {cat === 'all' ? 'Todas' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => { store.setHasFrame(false); setActiveStep('none'); }}
                            className={`w-full flex p-4 rounded-2xl border-2 transition-all ${!store.hasFrame ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' : 'border-zinc-100 hover:border-zinc-200'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                <X className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-left ml-4 flex flex-col justify-center">
                                <span className="text-xs font-black uppercase tracking-widest">Sem Moldura</span>
                            </div>
                        </button>

                        {store.availableFrames
                            .filter(f => selectedCategory === 'all' || f.category === selectedCategory)
                            .map(frame => {
                                const isSelected = store.hasFrame && store.frameProfileId === frame.id;
                                return (
                                    <button
                                        key={frame.id}
                                        onClick={() => { store.setFrameProfileId(frame.id); store.setHasFrame(true); }}
                                        className={`w-full flex p-4 rounded-2xl border-2 transition-all group ${
                                            isSelected ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' : 'border-zinc-100 hover:border-zinc-200 bg-white'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                            {frame.previewUrl ? (
                                                <img src={frame.previewUrl} alt={frame.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FrameChevron frame={frame} size={50} />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left ml-4 flex flex-col justify-center">
                                            <span className="text-xs font-black uppercase tracking-tight mb-1">{frame.name}</span>
                                            <span className={`text-[10px] font-bold ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                {frame.frameWidth}cm largura • {frame.category}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                    </div>
                </div>
            </SideMenu>

            {/* 3. Passe-Partout */}
            <SideMenu 
                isOpen={activeStep === 'passepartout'} 
                onClose={() => setActiveStep('none')} 
                title="PASSE-PARTOUT"
                price={price.total}
            >
                <div className="space-y-10 pt-4">
                    <div className="text-center">
                        <span className="text-5xl font-black text-zinc-900 tracking-tighter">
                            {store.passepartoutWidth}
                        </span>
                        <span className="text-lg font-black text-zinc-400 uppercase tracking-widest ml-2">cm</span>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">Largura da Margem</p>
                    </div>

                    <div className="px-2">
                        <input
                            type="range" min={0} max={10} step={0.5}
                            title="Largura do Passe-Partout"
                            value={store.passepartoutWidth}
                            onChange={e => store.setPassepartoutWidth(Number(e.target.value))}
                            className="w-full h-3 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900"
                        />
                        <div className="flex justify-between mt-4">
                            {[0, 2.5, 5, 7.5, 10].map(v => (
                                <span key={v} className="text-[10px] font-black text-zinc-300">{v}cm</span>
                            ))}
                        </div>
                    </div>

                    {store.passepartoutWidth > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 text-center">Cor do Cartão</p>
                            <div className="flex justify-center gap-4">
                                {PASSE_COLORS.map(c => (
                                    <button
                                        key={c}
                                        title={`Cor ${c}`}
                                        onClick={() => store.setPassepartoutColor(c)}
                                        className={`w-12 h-12 rounded-2xl border-4 transition-all ${store.passepartoutColor === c ? 'border-zinc-900 scale-110 shadow-lg' : 'border-zinc-50 shadow-sm hover:scale-105'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Info className="w-5 h-5 text-amber-500" />
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Dica Fine Art</h5>
                        </div>
                        <p className="text-xs font-bold text-amber-900/70 leading-relaxed">
                            O Passe-partout de 5cm é o padrão mais equilibrado para obras de arte, criando um respiro que valoriza a imagem e protege o papel do contato direto com o vidro.
                        </p>
                    </div>
                </div>
            </SideMenu>

            {/* 4. Vidro */}
            <SideMenu 
                isOpen={activeStep === 'glass'} 
                onClose={() => setActiveStep('none')} 
                title="PROTEÇÃO (VIDRO)"
                price={price.total}
            >
                <div className="space-y-4 pt-2">
                    {GLASS_OPTIONS.map(g => {
                        const isSelected = store.glassType === g.id;
                        return (
                            <button
                                key={g.id}
                                onClick={() => { store.setGlassType(g.id as any); setActiveStep('none'); }}
                                className={`w-full p-6 rounded-3xl border-2 text-left transition-all group ${
                                    isSelected ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-black text-sm uppercase tracking-widest">{g.label}</span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-200 bg-white'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <span className={`text-xs font-bold block ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{g.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </SideMenu>

            {/* 5. Papel */}
            <SideMenu 
                isOpen={activeStep === 'paper'} 
                onClose={() => setActiveStep('none')} 
                title="PAPEL DE IMPRESSÃO"
                price={price.total}
            >
                <div className="space-y-4 pt-2">
                    {store.availablePapers.map(paper => {
                        const isSelected = store.printType === paper.id;
                        return (
                            <button
                                key={paper.id}
                                onClick={() => { store.setPrintType(paper.id); setActiveStep('none'); }}
                                className={`w-full flex p-4 rounded-3xl border-2 transition-all ${
                                    isSelected ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl' : 'border-zinc-100 bg-white hover:border-zinc-200'
                                }`}
                            >
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 flex-shrink-0">
                                    {paper.imageUrl ? (
                                        <img src={paper.imageUrl} alt={paper.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-300">
                                            <Info className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left ml-4 flex flex-col justify-center">
                                    <span className="text-sm font-black uppercase tracking-tight mb-1">{paper.name}</span>
                                    <span className={`text-[10px] font-bold line-clamp-2 leading-tight ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        {paper.description}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </SideMenu>

            {/* ── Modals Originais ── */}
            <CartModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                onAddAnother={handleAddAnother}
            />
            {isCropping && (
                <ImageCropper
                    imageUrl={store.originalImage || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80'}
                    targetAspectRatio={store.width / store.height}
                    onCrop={handleCropComplete}
                    onClose={() => setIsCropping(false)}
                />
            )}
            {/* Modal de Imagem Ampliada */}
            {enlargedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
                    onClick={() => setEnlargedImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setEnlargedImage(null)}
                        title="Fechar"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img 
                        src={enlargedImage} 
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
                        alt="Zoomed"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

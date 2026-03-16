import { Upload, X, Scissors, CheckCircle2, ChevronRight } from 'lucide-react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { calculatePrice } from '../../utils/calculations';
import { analyzeImage } from '../../utils/imageAnalysis';
import { ImageCropper } from './ImageCropper';
import { useState } from 'react';
import UTIF from 'utif';
import { PaperModal } from './PaperModal';
import { FrameSelectionModal } from './FrameSelectionModal';
import { CartModal } from './CartModal';

const GLASS_OPTIONS = [
    { id: 'none', label: 'Sem Vidro', desc: 'Sem proteção' },
    { id: 'standard', label: 'Vidro Comum', desc: '8% reflexo' },
    { id: 'anti-reflective', label: 'ArtGlass', desc: 'Antirreflexo' },
] as const;

const PASSE_COLORS = ['#ffffff', '#f5f0e8', '#e8e0d0', '#c8b89a', '#1a1a1a'];

export function Configurator() {
    const store = useSimulatorStore();
    const price = calculatePrice(store as any);

    const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
    const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isCropping, setIsCropping] = useState(false);

    // Local dimension state for controlled inputs
    const [localWidth, setLocalWidth] = useState(String(store.width));
    const [localHeight, setLocalHeight] = useState(String(store.height));
    const [dimEdited, setDimEdited] = useState(false);
    const [hoveredFrame, setHoveredFrame] = useState<{ id: string; src: string; name: string } | null>(null);

    const analysis = store.userImage && store.imagePixels
        ? analyzeImage(store.imagePixels.width, store.imagePixels.height, store.width, store.height)
        : null;

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
        if (w > 0) store.setWidth(w);
        if (h > 0) store.setHeight(h);
        setDimEdited(false);
    };

    const handleFinalize = () => {
        store.addToCart(price.total);
        setIsCartModalOpen(true);
    };

    const handleAddAnother = () => {
        store.resetConfiguration();
        setLocalWidth('40');
        setLocalHeight('60');
        setIsCartModalOpen(false);
    };

    const selectedPaper = store.availablePapers.find(p => p.id === store.printType);
    const selectedFrame = store.availableFrames.find(f => f.id === store.frameProfileId);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-6 space-y-0 divide-y divide-zinc-100">

                {/* ── Upload da Arte ── */}
                <section className="py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Sua Arte</p>
                    {store.userImage ? (
                        <div className="space-y-2">
                            <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center aspect-video">
                                <img src={store.userImage} alt="Arte" className="max-h-full max-w-full object-contain" />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {analysis && (
                                <div className={`text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                                    analysis.qualityLabel === 'Ótima' ? 'bg-green-100 text-green-700' :
                                    analysis.qualityLabel === 'Boa' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    Qualidade {analysis.qualityLabel}
                                </div>
                            )}
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

                {/* ── Tamanho ── */}
                <section className="py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Tamanho da Imagem</p>
                    <div className="flex items-stretch gap-2">
                        <div className="relative flex-1">
                            <label className="absolute text-[9px] font-bold text-zinc-400 top-1.5 left-3">largura</label>
                            <input
                                type="number"
                                value={localWidth}
                                onChange={e => { setLocalWidth(e.target.value); setDimEdited(true); }}
                                className="w-full pt-5 pb-2 px-3 border-2 border-zinc-200 rounded-xl text-lg font-black text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                            />
                        </div>
                        <div className="flex items-center text-zinc-300 font-bold text-sm pb-1">×</div>
                        <div className="relative flex-1">
                            <label className="absolute text-[9px] font-bold text-zinc-400 top-1.5 left-3">altura</label>
                            <input
                                type="number"
                                value={localHeight}
                                onChange={e => { setLocalHeight(e.target.value); setDimEdited(true); }}
                                className="w-full pt-5 pb-2 px-3 border-2 border-zinc-200 rounded-xl text-lg font-black text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleConfirmDimensions}
                            className={`px-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                                dimEdited
                                    ? 'bg-zinc-900 text-white hover:bg-zinc-700'
                                    : 'bg-zinc-100 text-zinc-400'
                            }`}
                        >
                            OK
                        </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1.5">
                        Dimensões externas aproximadas: <span className="font-bold text-zinc-600">{(store.width + (store.hasFrame ? (selectedFrame?.frameWidth ?? 0) * 2 : 0)).toFixed(0)} × {(store.height + (store.hasFrame ? (selectedFrame?.frameWidth ?? 0) * 2 : 0)).toFixed(0)} cm</span>
                    </p>
                </section>

                {/* ── Moldura ── */}
                <section className="py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Moldura</p>
                            <p className="text-sm font-bold text-zinc-900 mt-0.5">
                                {store.hasFrame ? selectedFrame?.name ?? 'Selecione' : 'Sem Moldura'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsFrameModalOpen(true)}
                            className="text-[9px] font-black text-zinc-500 hover:text-zinc-900 uppercase tracking-widest flex items-center gap-0.5 transition-colors"
                        >
                            Ver Todas <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Thumbnail row — PRIMEIRO para o layout não mudar */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                        {/* Sem Moldura */}
                        <button
                            onClick={() => store.setHasFrame(false)}
                            className="flex-shrink-0 flex flex-col items-center gap-1.5"
                        >
                            <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                                !store.hasFrame ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400'
                            }`}>
                                <X className={`w-5 h-5 ${!store.hasFrame ? 'text-white' : 'text-zinc-400'}`} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-tight ${!store.hasFrame ? 'text-zinc-900' : 'text-zinc-400'}`}>Sem</span>
                        </button>

                        {store.availableFrames.map(frame => {
                            const isSelected = store.hasFrame && store.frameProfileId === frame.id;
                            const src = frame.previewUrl || frame.textureUrl;
                            return (
                                <button
                                    key={frame.id}
                                    onClick={() => { store.setFrameProfileId(frame.id); store.setHasFrame(true); }}
                                    onMouseEnter={() => setHoveredFrame({ id: frame.id, src, name: frame.name })}
                                    onMouseLeave={() => setHoveredFrame(null)}
                                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                                >
                                    <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                                        isSelected ? 'border-zinc-900 ring-2 ring-zinc-900/10' : 'border-zinc-200 hover:border-zinc-400'
                                    }`}>
                                        <img src={src} alt={frame.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-tight max-w-[64px] truncate ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                        {frame.category}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Preview ampliado — DEPOIS dos thumbnails, layout não muda ao aparecer */}
                    <div className="mt-2 min-h-[0px]">
                        {hoveredFrame && (
                            <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-xl flex flex-col items-center p-4 bg-white animate-in zoom-in-95 duration-150">
                                <img
                                    src={hoveredFrame.src}
                                    alt={hoveredFrame.name}
                                    className="w-full h-48 sm:h-64 rounded-xl object-contain bg-zinc-50"
                                />
                                <div className="mt-4 text-center">
                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight leading-tight">{hoveredFrame.name}</p>
                                    <p className="text-xs text-zinc-400 font-bold mt-1">
                                        {store.availableFrames.find(f => f.id === hoveredFrame.id)?.frameWidth} cm largura
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </section>

                {/* ── Passe-Partout (só com moldura) ── */}
                {store.hasFrame && (
                    <section className="py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Passe-Partout</p>
                                <p className="text-sm font-bold text-zinc-900 mt-0.5">
                                    {store.passepartoutWidth > 0 ? `${store.passepartoutWidth} cm` : 'Nenhum'}
                                </p>
                            </div>
                            {store.passepartoutWidth > 0 && (
                                <div className="flex gap-1.5">
                                    {PASSE_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => store.setPassepartoutColor(c)}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${store.passepartoutColor === c ? 'border-zinc-900 scale-110' : 'border-zinc-200 hover:border-zinc-400'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="range" min={0} max={10} step={0.5}
                            value={store.passepartoutWidth}
                            onChange={e => store.setPassepartoutWidth(Number(e.target.value))}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-zinc-900 bg-zinc-200"
                        />
                        <div className="flex justify-between text-[9px] text-zinc-400 font-bold mt-1">
                            <span>0 cm</span><span>10 cm</span>
                        </div>
                    </section>
                )}

                {/* ── Vidro (só com moldura) ── */}
                {store.hasFrame && (
                    <section className="py-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Proteção (Vidro)</p>
                        <div className="grid grid-cols-3 gap-2">
                            {GLASS_OPTIONS.map(g => {
                                const isSelected = store.glassType === g.id;
                                return (
                                    <button
                                        key={g.id}
                                        onClick={() => store.setGlassType(g.id as 'none' | 'standard' | 'anti-reflective')}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                                            isSelected
                                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                                : 'border-zinc-200 hover:border-zinc-400 text-zinc-900'
                                        }`}
                                    >
                                        <span className="font-black text-[10px] uppercase tracking-tight block">{g.label}</span>
                                        <span className={`text-[9px] block mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>{g.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Impressão ── */}
                <section className="py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Impressão</p>
                    <button
                        onClick={() => setIsPaperModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-zinc-900 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            {selectedPaper?.imageUrl && (
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-200 flex-shrink-0">
                                    <img src={selectedPaper.imageUrl} className="w-full h-full object-cover" alt={selectedPaper.name} />
                                </div>
                            )}
                            <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Papel Selecionado</span>
                                <span className="text-xs font-bold text-zinc-900">{selectedPaper?.name ?? '—'}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
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
                >
                    Finalizar Pedido
                </button>
            </div>

            {/* ── Modals ── */}
            <PaperModal isOpen={isPaperModalOpen} onClose={() => setIsPaperModalOpen(false)} />
            <FrameSelectionModal isOpen={isFrameModalOpen} onClose={() => setIsFrameModalOpen(false)} />
            <CartModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                onAddAnother={handleAddAnother}
            />
            {isCropping && store.originalImage && (
                <ImageCropper
                    imageUrl={store.originalImage}
                    targetAspectRatio={store.width / store.height}
                    onCrop={handleCropComplete}
                    onClose={() => setIsCropping(false)}
                />
            )}
        </div>
    );
}

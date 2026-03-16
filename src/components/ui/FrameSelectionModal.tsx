import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { SelectionModal } from './SelectionModal';
import { ChevronRight, Check } from 'lucide-react';

interface FrameSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FrameSelectionModal({ isOpen, onClose }: FrameSelectionModalProps) {
    const { availableFrames, frameProfileId, setFrameProfileId, setHasFrame } = useSimulatorStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Array.from(new Set(availableFrames.map(f => f.category)));
    const filteredFrames = availableFrames.filter(f => f.category === selectedCategory);

    const handleFrameSelect = (id: string) => {
        setFrameProfileId(id);
        setHasFrame(true);
        onClose();
        setSelectedCategory(null);
    };

    const handleNoFrame = () => {
        setHasFrame(false);
        onClose();
    };

    return (
        <SelectionModal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setSelectedCategory(null);
            }}
            title={selectedCategory ? `Molduras: ${selectedCategory}` : "Escolha a Categoria"}
        >
            {!selectedCategory ? (
                /* Step 1: Categories */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* No frame option */}
                    <button
                        onClick={handleNoFrame}
                        className="group p-8 rounded-2xl border-2 border-zinc-100 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left flex items-center justify-between"
                    >
                        <span className="text-xl font-bold text-zinc-400 group-hover:text-zinc-600 transition-colors">Sem Moldura</span>
                        <ChevronRight className="w-5 h-5 text-zinc-200 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="group p-8 rounded-2xl border-2 border-zinc-100 hover:border-zinc-900 hover:bg-zinc-900 transition-all text-left flex items-center justify-between"
                        >
                            <span className="text-xl font-bold text-zinc-900 group-hover:text-white transition-colors">{cat}</span>
                            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            ) : (
                /* Step 2: Gallery */
                <div className="flex flex-col gap-6">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors self-start"
                    >
                        ← Voltar para categorias
                    </button>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredFrames.map((frame) => {
                            const isSelected = frameProfileId === frame.id;
                            return (
                                <button
                                    key={frame.id}
                                    onClick={() => handleFrameSelect(frame.id)}
                                    className={`group flex flex-col text-left rounded-2xl overflow-hidden border-2 transition-all ${isSelected
                                        ? 'border-zinc-900 ring-4 ring-zinc-900/5'
                                        : 'border-zinc-100 hover:border-zinc-300'
                                        }`}
                                >
                                    <div className="aspect-square w-full overflow-hidden bg-zinc-100 relative">
                                        <img
                                            src={frame.previewUrl || frame.textureUrl}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                            alt={frame.name}
                                        />
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-zinc-900 text-white p-1 rounded-full shadow-lg">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-bold text-zinc-900 text-sm leading-tight mb-1">{frame.name}</h3>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{frame.frameWidth}cm largura</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </SelectionModal>
    );
}

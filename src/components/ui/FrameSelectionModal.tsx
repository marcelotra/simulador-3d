import { useSimulatorStore } from '../../store/useSimulatorStore';
import { SelectionModal } from './SelectionModal';
import { FrameCard } from './FrameCard';

interface FrameSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TABS = ['Todos', 'Material', 'Moldura', 'Tamanho', 'Passe-partout', 'Vidro'];

export function FrameSelectionModal({ isOpen, onClose }: FrameSelectionModalProps) {
    const { availableFrames, frameProfileId, setFrameProfileId, setHasFrame, hasFrame } = useSimulatorStore();

    const categories = Array.from(new Set(availableFrames.map(f => f.category)));

    const handleFrameSelect = (id: string) => {
        setFrameProfileId(id);
        setHasFrame(true);
        onClose();
    };

    const handleRemoveFrame = () => {
        setHasFrame(false);
        onClose();
    };

    return (
        <SelectionModal
            isOpen={isOpen}
            onClose={onClose}
            title="" // We'll render our own header
        >
            <div className="flex flex-col min-h-full">
                {/* Custom Header */}
                <div className="mx-auto flex flex-col items-center mb-12">
                    <h1 className="text-6xl font-light text-zinc-300 mb-8 mt-4">Escolha sua moldura</h1>
                    
                    {/* Tabs Navigation */}
                    <div className="flex gap-1 p-1 bg-zinc-900 rounded-full overflow-hidden mb-8">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                    tab === 'Moldura' 
                                        ? 'bg-orange-600 text-white shadow-lg' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Sub-navigation & Action */}
                    <div className="w-full flex items-center justify-between border-b border-orange-600 pb-2 mb-8">
                        <div className="flex gap-6">
                            <button className="text-[10px] font-black uppercase tracking-widest text-orange-600 border-b-2 border-orange-600">Todas</button>
                            {categories.map(cat => (
                                <button key={cat} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">{cat}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={handleRemoveFrame}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                            >
                                Remover moldura
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visualização</span>
                                <div className="w-10 h-5 bg-zinc-200 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories and Cards List */}
                <div className="max-w-6xl mx-auto w-full space-y-16 pb-20">
                    {categories.map(category => (
                        <div key={category} className="space-y-8">
                            <h2 className="text-5xl font-light text-zinc-300 lowercase">{category}</h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {availableFrames
                                    .filter(f => f.category === category)
                                    .map(frame => (
                                        <FrameCard
                                            key={frame.id}
                                            frame={frame}
                                            isSelected={hasFrame && frameProfileId === frame.id}
                                            onSelect={handleFrameSelect}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SelectionModal>
    );
}

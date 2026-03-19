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

    // Grouping logic to match reference image
    const woodFrames = availableFrames.filter(f => f.category === 'Madeira');
    const metalFrames = availableFrames.filter(f => f.category !== 'Madeira');

    const groups = [
        { id: 'wood', title: 'Wood Frame', items: woodFrames },
        { id: 'metal', title: 'Metal Frame', items: metalFrames }
    ].filter(g => g.items.length > 0);

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
                <div className="mx-auto flex flex-col items-center mb-16 pt-10">
                    <h1 className="text-[5rem] font-light text-[#9db8c5] mb-12 tracking-tight leading-none">Choose a frame</h1>
                    
                    {/* Tabs Navigation */}
                    <div className="flex gap-0.5 p-1 bg-[#333333] rounded-sm mb-12">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                                    tab === 'Moldura' 
                                        ? 'bg-[#ff4500] text-white' 
                                        : 'text-[#cccccc] hover:text-white'
                                }`}
                            >
                                {tab === 'Moldura' ? 'Frame' : tab === 'Todos' ? 'All' : tab}
                            </button>
                        ))}
                    </div>

                    {/* Sub-navigation & Action */}
                    <div className="w-full flex items-end justify-between border-b-2 border-[#ff4500] pb-3 mb-12">
                        <div className="flex gap-10">
                            <button className="text-[11px] font-black uppercase tracking-wider text-[#ff4500]">All frames</button>
                            {groups.map(group => (
                                <button key={group.id} className="text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors">
                                    {group.title}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-10">
                            <button 
                                onClick={handleRemoveFrame}
                                className="text-[11px] font-black uppercase tracking-wider text-[#9db8c5] hover:text-[#ff4500] flex items-center gap-1 transition-colors"
                            >
                                Remove frame
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-6 bg-zinc-200 rounded-full relative cursor-pointer border-2 border-zinc-300">
                                        <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-zinc-400 rounded-full" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-[#9db8c5]">Views</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories and Cards List */}
                <div className="max-w-7xl mx-auto w-full space-y-24 pb-32 px-4">
                    {groups.map(group => (
                        <div key={group.id} className="space-y-12">
                            <div className="flex justify-end pr-4">
                                <h2 className="text-[6rem] font-light text-[#9db8c5] lowercase leading-none tracking-tighter">
                                    {group.title}
                                </h2>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-12">
                                {group.items.map(frame => (
                                    <div key={frame.id} className="w-full flex justify-center">
                                        <div className="w-full max-w-3xl">
                                            <FrameCard
                                                frame={frame}
                                                isSelected={hasFrame && frameProfileId === frame.id}
                                                onSelect={handleFrameSelect}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SelectionModal>
    );
}

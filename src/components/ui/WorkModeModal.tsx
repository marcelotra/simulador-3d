import { SelectionModal } from './SelectionModal';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { FileText, Scissors } from 'lucide-react';

interface WorkModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
}

export function WorkModeModal({ isOpen, onClose, onNext }: WorkModeModalProps) {
    const store = useSimulatorStore();

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Como vamos montar sua obra?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 max-w-4xl mx-auto">
                <button
                    onClick={() => {
                        store.setHasFrame(false);
                        onNext();
                        onClose();
                    }}
                    className={`group p-10 rounded-[40px] border-2 transition-all text-left flex flex-col gap-6 ${!store.hasFrame ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-white'}`}
                >
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform group-hover:scale-110 ${!store.hasFrame ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                        <FileText className={`w-8 h-8 ${!store.hasFrame ? 'text-white' : 'text-zinc-900'}`} />
                    </div>
                    <div>
                        <h4 className="font-black text-xl uppercase tracking-tighter mb-2">Somente Impressão</h4>
                        <p className={`text-sm leading-relaxed font-medium ${!store.hasFrame ? 'text-white/60' : 'text-zinc-500'}`}>
                            Receba sua arte impressa em papéis Fine Art de alta qualidade, pronta para emoldurar depois.
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => {
                        store.setHasFrame(true);
                        onNext();
                        onClose();
                    }}
                    className={`group p-10 rounded-[40px] border-2 transition-all text-left flex flex-col gap-6 ${store.hasFrame ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-white'}`}
                >
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform group-hover:scale-110 ${store.hasFrame ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                        <Scissors className={`w-8 h-8 ${store.hasFrame ? 'text-white' : 'text-zinc-900'}`} />
                    </div>
                    <div>
                        <h4 className="font-black text-xl uppercase tracking-tighter mb-2">Impressão + Moldura</h4>
                        <p className={`text-sm leading-relaxed font-medium ${store.hasFrame ? 'text-white/60' : 'text-zinc-500'}`}>
                            Sua obra completa: impressa, emoldurada e pronta para pendurar. Qualidade de galeria.
                        </p>
                    </div>
                </button>
            </div>
        </SelectionModal>
    );
}

import { SelectionModal } from './SelectionModal';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Check, Layers } from 'lucide-react';

interface BackingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BackingModal({ isOpen, onClose }: BackingModalProps) {
    const store = useSimulatorStore();

    const options = [
        { id: 'MDF 3mm', name: 'MDF 3mm', desc: 'Padrão de mercado, rígido e durável.' },
        { id: 'Foam Board 5mm', name: 'Foam Board 5mm', desc: 'Livre de ácido, ideal para conservação fine art.' },
        { id: 'Eucatex', name: 'Eucatex', desc: 'Opção econômica para quadros menores.' }
    ];

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Painel de Fundo">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                {options.map((option) => {
                    const isSelected = store.backingType === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => {
                                store.setBackingType(option.id);
                                onClose();
                            }}
                            className={`group p-8 rounded-[32px] border-2 text-left transition-all flex flex-col gap-4 ${isSelected
                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                    : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-white hover:shadow-xl'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-white/10' : 'bg-white shadow-sm'
                                }`}>
                                <Layers className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-zinc-900'}`} />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-black uppercase tracking-tight text-sm">{option.name}</h3>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? 'text-white/60' : 'text-zinc-500'}`}>
                                    {option.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </SelectionModal>
    );
}

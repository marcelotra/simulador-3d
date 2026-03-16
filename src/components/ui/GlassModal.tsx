import { SelectionModal } from './SelectionModal';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Check, ShieldCheck } from 'lucide-react';

interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlassModal({ isOpen, onClose }: GlassModalProps) {
    const store = useSimulatorStore();

    const types = [
        { id: 'none', name: 'Sem Vidro', desc: 'Apenas verniz UV para proteção leve', icon: ShieldCheck },
        { id: 'standard', name: 'Vidro Comum', desc: 'Proteção padrão contra poeira e toques', icon: ShieldCheck },
        { id: 'anti-reflective', name: 'Museu ArtGlass', desc: 'Antireflexo invisível e proteção UV 99%', icon: ShieldCheck }
    ];

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Proteção (Vidro)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                {types.map((type) => {
                    const isSelected = store.glassType === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => {
                                store.setGlassType(type.id as any);
                                onClose();
                            }}
                            className={`group p-8 rounded-[32px] border-2 text-left transition-all flex flex-col gap-4 ${isSelected
                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                    : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-white hover:shadow-xl'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-white/10' : 'bg-white shadow-sm'
                                }`}>
                                <type.icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-zinc-900'}`} />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-black uppercase tracking-tight text-sm">{type.name}</h3>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? 'text-white/60' : 'text-zinc-500'}`}>
                                    {type.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </SelectionModal>
    );
}

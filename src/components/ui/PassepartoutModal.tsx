import { SelectionModal } from './SelectionModal';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Ruler } from 'lucide-react';

interface PassepartoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PassepartoutModal({ isOpen, onClose }: PassepartoutModalProps) {
    const store = useSimulatorStore();

    const colors = [
        { hex: '#ffffff', name: 'Branco Neve' },
        { hex: '#f4f4f5', name: 'Off White' },
        { hex: '#18181b', name: 'Preto Absoluto' },
        { hex: '#71717a', name: 'Cinza Médio' }
    ];

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Configuração de Passe-partout">
            <div className="max-w-2xl mx-auto py-6 space-y-12">
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-zinc-900" />
                            Largura da Margem
                        </label>
                        <span className="text-3xl font-black text-zinc-900 tabular-nums">{store.passepartoutWidth}<span className="text-sm ml-1 text-zinc-400 uppercase">cm</span></span>
                    </div>

                    <div className="px-2">
                        <input
                            title="Ajustar largura do passe-partout"
                            type="range"
                            min="0" max="15" step="1"
                            value={store.passepartoutWidth}
                            onChange={(e) => store.setPassepartoutWidth(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900"
                        />
                        <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-300 uppercase tracking-widest px-1">
                            <span>Mín: 0cm</span>
                            <span>Máx: 15cm</span>
                        </div>
                    </div>
                </section>

                <section>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 px-2">Escolha a Cor</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                        {colors.map((color) => {
                            const isSelected = store.passepartoutColor === color.hex;
                            return (
                                <button
                                    key={color.hex}
                                    onClick={() => store.setPassepartoutColor(color.hex)}
                                    className={`group flex flex-col items-center gap-3 p-4 rounded-[28px] border-2 transition-all ${isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200 bg-white'
                                        }`}
                                >
                                    <div
                                        className="w-12 h-12 rounded-2xl shadow-inner border border-zinc-100 transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                        {color.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <button
                    onClick={onClose}
                    className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
                >
                    Aplicar Configurações
                </button>
            </div>
        </SelectionModal>
    );
}

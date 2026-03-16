import { SelectionModal } from './SelectionModal';
import { useSimulatorStore } from '../../store/useSimulatorStore';

interface DimensionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DimensionsModal({ isOpen, onClose }: DimensionsModalProps) {
    const store = useSimulatorStore();

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Dimensões da Obra">
            <div className="max-w-md mx-auto py-10">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="block text-sm font-black text-zinc-400 uppercase tracking-widest">Largura (cm)</label>
                        <input
                            title="Largura da imagem em cm"
                            type="number"
                            value={store.width}
                            onChange={(e) => store.setWidth(Number(e.target.value))}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-2xl font-black text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-black text-zinc-400 uppercase tracking-widest">Altura (cm)</label>
                        <input
                            title="Altura da imagem em cm"
                            type="number"
                            value={store.height}
                            onChange={(e) => store.setHeight(Number(e.target.value))}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-2xl font-black text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                        />
                    </div>
                </div>

                {/* Quantidade */}
                <div className="mt-8 space-y-3">
                    <label className="block text-sm font-black text-zinc-400 uppercase tracking-widest">Quantidade</label>
                    <div className="flex items-center gap-4">
                        <button
                            title="Diminuir quantidade"
                            onClick={() => store.setQuantity(store.quantity - 1)}
                            className="w-14 h-14 rounded-2xl bg-zinc-50 border-2 border-zinc-100 text-2xl font-black text-zinc-900 flex items-center justify-center hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all active:scale-95"
                        >
                            −
                        </button>
                        <input
                            title="Quantidade de cópias"
                            type="number"
                            min={1}
                            value={store.quantity}
                            onChange={(e) => store.setQuantity(Number(e.target.value))}
                            className="flex-1 bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-2xl font-black text-zinc-900 text-center focus:outline-none focus:border-zinc-900 transition-all"
                        />
                        <button
                            title="Aumentar quantidade"
                            onClick={() => store.setQuantity(store.quantity + 1)}
                            className="w-14 h-14 rounded-2xl bg-zinc-50 border-2 border-zinc-100 text-2xl font-black text-zinc-900 flex items-center justify-center hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all active:scale-95"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                    <p className="text-xs text-zinc-500 leading-relaxed text-center font-medium">
                        As dimensões informadas referem-se à área da imagem.
                        O tamanho total final será calculado automaticamente com base na moldura e margens escolhidas.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-10 bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
                >
                    Confirmar Medidas
                </button>
            </div>
        </SelectionModal>
    );
}

import { X, ShoppingBag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { SelectionModal } from './SelectionModal';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAnother: () => void;
}

export function CartModal({ isOpen, onClose, onAddAnother }: CartModalProps) {
    const { cart, removeFromCart, availablePapers, availableFrames } = useSimulatorStore();

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const getPaperName = (id: string) => availablePapers.find(p => p.id === id)?.name || id;
    const getFrameName = (id: string | null) => id ? availableFrames.find(f => f.id === id)?.name : 'Sem moldura';

    return (
        <SelectionModal
            isOpen={isOpen}
            onClose={onClose}
            title="Seu Carrinho"
        >
            <div className="flex flex-col h-[60vh]">
                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <p className="font-medium">Seu carrinho está vazio</p>
                        <button
                            onClick={onAddAnother}
                            className="text-sm font-bold text-zinc-900 underline underline-offset-4"
                        >
                            Começar uma nova arte
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 relative group transition-all hover:border-zinc-200"
                                >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-zinc-100 flex-shrink-0">
                                        {item.userImage ? (
                                            <img src={item.userImage} className="w-full h-full object-cover" alt="Sua arte" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                                                <X className="w-4 h-4 text-zinc-300" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-zinc-900 truncate">
                                                Configuração {item.width}x{item.height}cm
                                            </h4>
                                            <span className="font-black text-sm text-zinc-900">
                                                R$ {item.price.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-zinc-500 font-medium">
                                                {item.hasFrame ? `Moldura: ${getFrameName(item.frameProfileId)}` : 'Somente Impressão'}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-medium">
                                                Papel: {getPaperName(item.printType)}
                                            </p>
                                            {item.glassType !== 'none' && (
                                                <p className="text-[10px] text-zinc-500 font-medium uppercase">
                                                    Vidro: {item.glassType}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-100">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total do Carrinho</p>
                                    <p className="text-3xl font-black text-zinc-900 tracking-tighter">
                                        R$ {total.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                                <button
                                    onClick={onAddAnother}
                                    className="flex items-center gap-2 py-3 px-6 rounded-xl border-2 border-zinc-900 text-zinc-900 font-bold text-xs hover:bg-zinc-900 hover:text-white transition-all active:scale-[0.98] uppercase tracking-tight"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar arte
                                </button>
                            </div>

                            <button className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/10 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                                <CheckCircle2 className="w-5 h-5" />
                                FECHAR PEDIDO AGORA
                            </button>
                        </div>
                    </>
                )}
            </div>
        </SelectionModal>
    );
}

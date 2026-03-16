import { X, Image as ImageIcon, Ruler, FileText, Box, ShieldCheck, ChevronRight, Layers, CheckCircle2 } from 'lucide-react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

interface DashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStep: (stepId: number) => void;
    onOpenModal: (modalId: string) => void;
}

export function DashboardModal({ isOpen, onClose, onSelectStep, onOpenModal }: DashboardModalProps) {
    const store = useSimulatorStore();

    if (!isOpen) return null;

    const steps = [
        { id: 'mode', title: 'Modo', icon: Box, stepIndex: 0, description: store.hasFrame ? 'Impressão + Moldura' : 'Somente Impressão' },
        { id: 'size', title: 'Dimensões', icon: Ruler, stepIndex: 1, description: `${store.width}x${store.height}cm` },
        { id: 'arte', title: 'Sua Arte', icon: ImageIcon, stepIndex: 2, description: store.userImage ? 'Imagem Carregada' : 'Nenhuma imagem' },
        { id: 'paper', title: 'Impressão', icon: FileText, stepIndex: 3, description: store.availablePapers.find(p => p.id === store.printType)?.name || 'Selecionar papel' },
        ...(store.hasFrame ? [
            { id: 'frame', title: 'Moldura', icon: Layers, stepIndex: 4, description: store.availableFrames.find(f => f.id === store.frameProfileId)?.name || 'Selecionar moldura' },
            { id: 'passepartout', title: 'Passe-partout', icon: Ruler, stepIndex: 5, description: store.passepartoutWidth > 0 ? `${store.passepartoutWidth}cm - ${store.passepartoutColor}` : 'Sem margem' },
            { id: 'glass', title: 'Vidro', icon: ShieldCheck, stepIndex: 6, description: store.glassType === 'none' ? 'Sem vidro' : store.glassType },
            { id: 'backing', title: 'Fundo', icon: FileText, stepIndex: 7, description: store.backingType }
        ] : []),
        { id: 'review', title: 'Resumo', icon: CheckCircle2, stepIndex: store.hasFrame ? 8 : 4, description: 'Finalizar pedido' }
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="px-10 py-8 border-b border-zinc-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">Painel de Controle</h2>
                        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">Gerencie todas as etapas da sua obra em um só lugar</p>
                    </div>
                    <button onClick={onClose} title="Fechar painel" className="p-3 hover:bg-zinc-100 rounded-full transition-all">
                        <X className="w-8 h-8 text-zinc-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (['mode', 'size', 'paper', 'frame', 'passepartout', 'glass', 'backing'].includes(item.id)) {
                                        onOpenModal(item.id);
                                    }
                                    onSelectStep(item.stepIndex);
                                    onClose();
                                }}
                                className="group relative bg-zinc-50 border-2 border-transparent hover:border-zinc-900 p-6 rounded-[32px] text-left transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6 text-zinc-900" />
                                </div>
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-1">{item.title}</h3>
                                <p className="text-[11px] text-zinc-500 font-medium leading-tight line-clamp-2">{item.description}</p>

                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-zinc-900" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-10 py-8 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                    >
                        Voltar para o Simulador
                    </button>
                </div>
            </div>
        </div>
    );
}

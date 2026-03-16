import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { SelectionModal } from './SelectionModal';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

// Category icon images (reuse paper imageUrl from first paper of each category)
const CATEGORY_ICONS: Record<string, { emoji: string; description: string }> = {
    'Fotográfico': { emoji: '📷', description: 'Papéis brilhantes e luster ideais para fotografias com cores vibrantes' },
    'Fine Art': { emoji: '🎨', description: 'Papéis 100% algodão de museu, para reproduções de alta qualidade' },
    'Canvas': { emoji: '🖼️', description: 'Tecidos com textura de tela, perfeitos para obras contemporâneas' },
};

interface PaperModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaperModal({ isOpen, onClose }: PaperModalProps) {
    const { availablePapers, printType, setPrintType } = useSimulatorStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Derive unique categories preserving insertion order
    const categories = Array.from(new Set(availablePapers.map(p => p.category ?? 'Outros')));
    const papersInCategory = selectedCategory
        ? availablePapers.filter(p => (p.category ?? 'Outros') === selectedCategory)
        : [];

    const handleSelect = (paperId: string) => {
        setPrintType(paperId);
        onClose();
        setSelectedCategory(null);
    };

    const handleClose = () => {
        onClose();
        setSelectedCategory(null);
    };

    const title = selectedCategory ? selectedCategory : 'Tipo de Impressão';

    return (
        <SelectionModal isOpen={isOpen} onClose={handleClose} title={title}>
            {/* ── STEP 1: Category list ── */}
            {!selectedCategory && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-xs text-zinc-400 font-medium mb-6">
                        Selecione o tipo de papel para ver as opções disponíveis.
                    </p>
                    {categories.map((cat) => {
                        const meta = CATEGORY_ICONS[cat] ?? { emoji: '📄', description: '' };
                        const firstPaper = availablePapers.find(p => (p.category ?? 'Outros') === cat);
                        const papersCount = availablePapers.filter(p => (p.category ?? 'Outros') === cat).length;
                        const isCurrentCategory = availablePapers.find(p => p.id === printType)?.category === cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full group flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${isCurrentCategory
                                        ? 'border-zinc-900 bg-zinc-50'
                                        : 'border-zinc-100 bg-white hover:border-zinc-300'
                                    }`}
                            >
                                {/* Category thumbnail */}
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 shadow-inner">
                                    {firstPaper?.imageUrl ? (
                                        <img
                                            src={firstPaper.imageUrl}
                                            alt={cat}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            {meta.emoji}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-zinc-900 text-base uppercase tracking-tight">{cat}</h3>
                                        {isCurrentCategory && (
                                            <span className="bg-zinc-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Atual</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-zinc-500 leading-snug">{meta.description}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-widest">
                                        {papersCount} {papersCount === 1 ? 'opção' : 'opções'}
                                    </p>
                                </div>

                                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors flex-shrink-0" />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── STEP 2: Papers in category ── */}
            {selectedCategory && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Back button */}
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Voltar às categorias
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {papersInCategory.map((paper) => {
                            const isSelected = printType === paper.id;
                            return (
                                <button
                                    key={paper.id}
                                    onClick={() => handleSelect(paper.id)}
                                    className={`group relative flex flex-col text-left rounded-2xl overflow-hidden border-2 transition-all ${isSelected
                                            ? 'border-zinc-900 ring-4 ring-zinc-900/5'
                                            : 'border-zinc-100 hover:border-zinc-300'
                                        }`}
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                                        <img
                                            src={paper.imageUrl}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                            alt={paper.name}
                                        />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-zinc-900 text-base leading-tight">{paper.name}</h3>
                                            {isSelected && (
                                                <div className="bg-zinc-900 text-white p-1 rounded-full flex-shrink-0 ml-2">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 leading-relaxed flex-1">
                                            {paper.description}
                                        </p>
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

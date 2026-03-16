import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSimulatorStore } from '../store/useSimulatorStore';
import {
    FileText,
    ImageIcon,
    Maximize2,
    Scissors,
    Frame,
    Ruler,
    ArrowLeft,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type StepKey =
    | 'material'
    | 'has-material'
    | 'print-type'
    | 'dimensions'
    | 'mounting';

interface Option {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    imageUrl?: string;
}

interface StepConfig {
    key: StepKey;
    question: string;
    subtitle?: string;
    options: Option[];
}

// ─── Step Data ────────────────────────────────────────────────────────────────

const STEP_CONFIGS: Record<StepKey, Omit<StepConfig, 'key'>> = {
    material: {
        question: 'O que você quer enquadrar?',
        subtitle: 'Selecione o tipo de material da sua obra',
        options: [
            {
                id: 'paper',
                label: 'Papel',
                description: 'Fotografias, ilustrações, aquarelas, gravuras e obras em papel Fine Art.',
                icon: FileText,
            },
            {
                id: 'canvas',
                label: 'Canvas',
                description: 'Impressões em tela de algodão/poliéster, pinturas e obras em tecido.',
                icon: ImageIcon,
            },
        ],
    },
    'has-material': {
        question: 'Você já tem o material pronto?',
        subtitle: 'Possui o papel ou canvas já impresso, ou precisa incluir a impressão?',
        options: [
            {
                id: 'yes',
                label: 'Já tenho o material',
                description: 'Trago meu papel ou canvas já impresso e pronto para montagem.',
                icon: Sparkles,
            },
            {
                id: 'no',
                label: 'Preciso de impressão',
                description: 'Quero incluir a impressão Fine Art junto com a montagem.',
                icon: Frame,
            },
        ],
    },
    'print-type': {
        question: 'Qual o tipo de impressão?',
        subtitle: 'Escolha a mídia que melhor representa sua obra',
        options: [
            {
                id: 'photo',
                label: 'Fotográfico',
                description: 'Papel fotográfico Luster ou Glossy. Ideal para fotografias com cores vivas e pretos profundos.',
                icon: Sparkles,
            },
            {
                id: 'fine-art',
                label: 'Fine Art',
                description: 'Papel 100% algodão Hahnemühle. O padrão de museus — longevidade de 100+ anos.',
                icon: Frame,
            },
        ],
    },
    dimensions: {
        question: 'Qual o tamanho da arte?',
        subtitle: 'Você poderá ajustar as medidas exatas no simulador',
        options: [
            {
                id: '30x40',
                label: 'Pequeno',
                description: '30 × 40 cm — Ideal para mesas, prateleiras e paredes compactas.',
                icon: Ruler,
            },
            {
                id: '60x90',
                label: 'Médio',
                description: '60 × 90 cm — O favorito: presença na parede sem dominar o ambiente.',
                icon: Ruler,
            },
            {
                id: '90x120',
                label: 'Grande',
                description: '90 × 120 cm — Impacto máximo. Perfeito para salas e galerias.',
                icon: Ruler,
            },
            {
                id: 'custom',
                label: 'Personalizado',
                description: 'Defina as medidas exatas no simulador interativo.',
                icon: Maximize2,
            },
        ],
    },
    mounting: {
        question: 'Qual o tipo de montagem?',
        subtitle: 'Como você quer que sua obra seja apresentada?',
        options: [], // injected dynamically
    },
};

const MOUNTING_PAPER: Option[] = [
    {
        id: 'basic',
        label: 'Montagem Básica',
        description: 'Impressão colocada diretamente na moldura, sem vidro. Econômica e direta.',
        icon: Frame,
        imageUrl: '/mount_basic.png',
    },
    {
        id: 'sandwich',
        label: 'Sanduíche de Vidro',
        description: 'Obra prensada entre dois vidros com margem transparente e moldura em volta.',
        icon: Maximize2,
        imageUrl: '/mount_sandwich.png',
    },
    {
        id: 'passepartout',
        label: 'Passe-Partout',
        description: 'Margem de cartão ao redor da obra. Elegante, galeria. Valoriza qualquer peça.',
        icon: Scissors,
        imageUrl: '/mount_passepartout.png',
    },
    {
        id: 'floating',
        label: 'Flutuante',
        description: 'A arte parece flutuar dentro da moldura, sem encostar nas bordas. Contemporâneo.',
        icon: Sparkles,
        imageUrl: '/mount_floating.png',
    },
];

const MOUNTING_CANVAS: Option[] = [
    {
        id: 'framed',
        label: 'Com Moldura',
        description: 'Canvas esticado no chassi e finalizado com moldura. Clássico e elegante.',
        icon: Frame,
        imageUrl: '/mount_canvas_framed.png',
    },
    {
        id: 'stretched',
        label: 'Somente Chassi',
        description: 'Canvas tensionado sobre chassi de madeira. Moderno, limpo, pronto para pendurar.',
        icon: Maximize2,
        imageUrl: '/mount_canvas_stretched.png',
    },
];

// ─── Sequence logic ───────────────────────────────────────────────────────────

function buildSequence(sel: Record<string, string>): StepKey[] {
    const base: StepKey[] = ['material', 'has-material'];
    // If client doesn't have material, ask print type (paper only — canvas has no sub-type here)
    if (sel['has-material'] === 'no' && sel['material'] === 'paper') {
        base.push('print-type');
    }
    base.push('dimensions', 'mounting');
    return base;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuotePage() {
    const navigate = useNavigate();
    const store = useSimulatorStore();

    const [selections, setSelections] = useState<Record<string, string>>({});
    const [currentStepKey, setCurrentStepKey] = useState<StepKey>('material');
    const [animating, setAnimating] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

    const stepSequence = buildSequence(selections);
    const currentIndex = stepSequence.indexOf(currentStepKey);
    const totalSteps = stepSequence.length;
    const progress = Math.max(2, (currentIndex / (totalSteps - 1)) * 100);

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.width = `${progress}%`;
        }
    }, [progress]);

    const transitionTo = useCallback((nextKey: StepKey) => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentStepKey(nextKey);
            setAnimating(false);
        }, 280);
    }, []);

    const handleSelect = (optionId: string) => {
        const updated = { ...selections, [currentStepKey]: optionId };
        setSelections(updated);

        if (currentStepKey === 'mounting') {
            applyToStore(updated);
            navigate('/simulador');
            return;
        }

        const seq = buildSequence(updated);
        const nextIndex = seq.indexOf(currentStepKey) + 1;
        if (nextIndex < seq.length) {
            transitionTo(seq[nextIndex]);
        }
    };

    const handleBack = () => {
        if (currentIndex === 0) {
            navigate('/');
            return;
        }
        transitionTo(stepSequence[currentIndex - 1]);
    };

    const applyToStore = (sel: Record<string, string>) => {
        const dimMap: Record<string, { w: number; h: number }> = {
            '30x40': { w: 30, h: 40 },
            '60x90': { w: 60, h: 90 },
            '90x120': { w: 90, h: 120 },
            custom: { w: 40, h: 60 },
        };
        const dim = dimMap[sel['dimensions']] ?? { w: 40, h: 60 };
        store.setWidth(dim.w);
        store.setHeight(dim.h);

        const mounting = sel['mounting'];
        const material = sel['material'];

        if (material === 'canvas') {
            store.setPrintType('canvas-fine');
            store.setHasFrame(mounting === 'framed');
            store.setPassepartoutWidth(0);
            store.setGlassType('none');
        } else {
            // Determine print type
            const printSel = sel['print-type'];
            store.setPrintType(printSel === 'fine-art' ? 'cotton-310' : 'photo-230');

            // Mounting configuration
            switch (mounting) {
                case 'basic':
                    store.setHasFrame(true);
                    store.setGlassType('none');
                    store.setPassepartoutWidth(0);
                    break;
                case 'sandwich':
                    store.setHasFrame(true);
                    store.setGlassType('standard');
                    store.setPassepartoutWidth(0);
                    break;
                case 'passepartout':
                    store.setHasFrame(true);
                    store.setGlassType('standard');
                    store.setPassepartoutWidth(5);
                    break;
                case 'floating':
                    store.setHasFrame(true);
                    store.setGlassType('none');
                    store.setPaperMargin(2);
                    store.setPassepartoutWidth(0);
                    break;
            }
        }
    };

    // Build effective step config (inject dynamic mounting options)
    const getStepConfig = (): StepConfig => {
        const base = STEP_CONFIGS[currentStepKey];
        if (currentStepKey === 'mounting') {
            return {
                key: 'mounting',
                ...base,
                options: selections['material'] === 'canvas' ? MOUNTING_CANVAS : MOUNTING_PAPER,
            };
        }
        return { key: currentStepKey, ...base };
    };

    const step = getStepConfig();
    const is4cols = step.options.length === 4;

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans quote-page-enter">
            {/* ── Header ── */}
            <header className="px-8 py-5 flex items-center justify-between border-b border-white/5">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo_fuse.png" alt="Fuse Galeria" className="h-10 w-auto object-contain" />
                    <div>
                        <p className="text-xs font-black text-white uppercase tracking-tighter leading-none">Fuse Galeria</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Fine Art Specialist</p>
                    </div>
                </Link>

                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {currentIndex === 0 ? 'Início' : 'Voltar'}
                </button>
            </header>

            {/* ── Progress bar ── */}
            <div className="w-full h-0.5 bg-white/5">
                <div
                    ref={progressRef}
                    className="h-full bg-white/50 transition-all duration-700 ease-out"
                />
            </div>

            {/* ── Step indicator ── */}
            <div className="flex items-center justify-center gap-2 pt-6 px-8">
                {stepSequence.map((key, i) => (
                    <div
                        key={key}
                        className={`h-1 rounded-full transition-all duration-500 ${i <= currentIndex ? 'bg-white/60 w-8' : 'bg-white/10 w-4'}`}
                    />
                ))}
            </div>

            {/* ── Main content ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div
                    className="quote-step w-full max-w-4xl"
                    data-animating={String(animating)}
                >
                    {/* Question */}
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 mb-3">
                            Passo {currentIndex + 1} de {totalSteps}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-3">
                            {step.question}
                        </h1>
                        {step.subtitle && (
                            <p className="text-sm text-white/40 font-medium">{step.subtitle}</p>
                        )}
                    </div>

                    {/* Options */}
                    <div className={`grid gap-4 ${is4cols ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {step.options.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = selections[currentStepKey] === opt.id;
                            const hasImage = !!opt.imageUrl;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleSelect(opt.id)}
                                    className={`
                                        group relative text-left rounded-3xl border-2 flex flex-col
                                        overflow-hidden transition-all duration-300
                                        ${!hasImage ? 'p-8 gap-5' : ''}
                                        ${is4cols && !hasImage ? 'aspect-square' : ''}
                                        ${isSelected
                                            ? 'border-white bg-white text-zinc-900 shadow-[0_0_60px_rgba(255,255,255,0.12)]'
                                            : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.08] text-white'
                                        }
                                    `}
                                >
                                    {/* Image preview (mounting step only) */}
                                    {hasImage && (
                                        <div className={`w-full overflow-hidden flex-shrink-0 ${is4cols ? 'h-40' : 'h-52'}`}>
                                            <img
                                                src={opt.imageUrl}
                                                alt={opt.label}
                                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
                                            />
                                        </div>
                                    )}

                                    {/* Text content */}
                                    <div className={`flex flex-col gap-5 flex-1 ${hasImage ? 'p-6' : ''}`}>
                                        {!hasImage && (
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-zinc-900/10' : 'bg-white/[0.08]'}`}>
                                                <Icon className={`w-6 h-6 ${isSelected ? 'text-zinc-900' : 'text-white/70'}`} />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className={`font-black text-base uppercase tracking-tight mb-1.5 ${isSelected ? 'text-zinc-900' : 'text-white'}`}>
                                                {opt.label}
                                            </h3>
                                            <p className={`text-xs leading-relaxed font-medium ${isSelected ? 'text-zinc-600' : 'text-white/40'}`}>
                                                {opt.description}
                                            </p>
                                        </div>

                                        {hasImage && (
                                            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${isSelected ? 'text-zinc-900' : 'text-white/30 group-hover:text-white/60'} transition-colors`}>
                                                <span>Selecionar</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>

                                    {!hasImage && (
                                        <ChevronRight className={`w-4 h-4 absolute bottom-6 right-6 transition-all ${isSelected ? 'text-zinc-900 translate-x-0 opacity-100' : 'text-white/20 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                    )}

                                    {/* Selected indicator for image cards */}
                                    {hasImage && isSelected && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="px-8 py-5 text-center text-[10px] text-white/15 font-bold uppercase tracking-widest border-t border-white/5">
                © {new Date().getFullYear()} Fuse Galeria • Fine Art Specialist
            </footer>
        </div>
    );
}

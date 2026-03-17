import { Layout, Columns, Rows, Grid, Square, Percent } from 'lucide-react';
import { useSimulatorStore, SplitType } from '../../store/useSimulatorStore';
import { SectionTitle } from './Configurator';

const SPLIT_OPTIONS = [
    { id: 'single', label: 'Único', icon: Square },
    { id: 'asymmetric', label: 'Corte Assimétrico', icon: Layout },
    { id: 'vertical', label: 'Corte Vertical', icon: Columns },
    { id: 'horizontal', label: 'Corte Horizontal', icon: Rows },
    { id: 'grid', label: 'Corte Cruzado', icon: Grid },
] as const;

export function SplitSettings() {
    const { 
        splitType, setSplitType, 
        splitColumns, setSplitColumns,
        splitHeightRatio, setSplitHeightRatio,
        splitGap, setSplitGap
    } = useSimulatorStore();

    return (
        <section className="py-4 space-y-4">
            <div>
                <SectionTitle step={3} title="Defina as Divisões" tooltip="Escolha se a sua imagem será impressa em um quadro único ou dividida em várias partes (Díptico, Tríptico, etc). A Arte será cortada para caber no formato escolhido." />
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                    {SPLIT_OPTIONS.map((opt) => {
                        const isSelected = splitType === opt.id;
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => setSplitType(opt.id as SplitType)}
                                className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                            >
                                <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-400'
                                }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-tight text-center leading-tight max-w-[64px] ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                    {opt.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {splitType !== 'single' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Columns Selector */}
                    {['vertical', 'asymmetric', 'grid'].includes(splitType) && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Quantidade de COLUNAS</p>
                            <div className="flex gap-2">
                                {[2, 3, 4, 5].map((cols) => (
                                    <button
                                        key={cols}
                                        onClick={() => setSplitColumns(cols)}
                                        className={`flex-1 py-2 rounded-lg border-2 font-bold text-xs transition-all ${
                                            splitColumns === cols ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'
                                        }`}
                                    >
                                        {cols}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Asymmetric Ratio Selector */}
                    {splitType === 'asymmetric' && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Defina a ALTURA INICIAL</p>
                            <div className="flex gap-2">
                                {[0.8, 0.9].map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setSplitHeightRatio(ratio)}
                                        className={`flex-1 py-2 rounded-lg border-2 font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                                            splitHeightRatio === ratio ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'
                                        }`}
                                    >
                                        <Percent className="w-3 h-3" />
                                        {ratio * 100}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gap Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Espaçamento entre quadros</p>
                            <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">{splitGap} cm</span>
                        </div>
                        <input
                            type="range" min={1} max={5} step={0.5}
                            value={splitGap}
                            onChange={e => setSplitGap(Number(e.target.value))}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-zinc-900 bg-zinc-200"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}

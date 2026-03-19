import { FrameData } from '../../store/useSimulatorStore';

interface FrameCardProps {
    frame: FrameData;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export function FrameCard({ frame, isSelected, onSelect }: FrameCardProps) {
    const { name, salePrice, features, frameWidth, frameDepth, profileSVG, elbowUrl, textureUrl } = frame;

    return (
        <button
            onClick={() => onSelect(frame.id)}
            className={`group w-full flex flex-col md:flex-row rounded-[2.5rem] border-0 transition-all overflow-hidden shadow-sm hover:shadow-xl ${
                isSelected ? 'ring-0' : ''
            }`}
        >
            {/* Visual Area (Left) */}
            <div className="md:w-[55%] p-8 bg-white flex items-center justify-center relative min-h-[280px] border-r border-zinc-50">
                {/* Elbow / Chevron View */}
                <div className="absolute inset-0 flex items-center justify-center p-10 mt-[-20px]">
                    <img 
                        src={elbowUrl || textureUrl} 
                        alt={name} 
                        className="max-w-[75%] max-h-[75%] object-contain transition-transform group-hover:scale-105 duration-700 drop-shadow-2xl" 
                    />
                </div>

                {/* Profile Drawing (Bottom Right Overlay) */}
                <div className="absolute bottom-10 right-10 flex items-end gap-3 scale-110">
                    {/* Vertical Dimension (Depth) */}
                    <div className="flex flex-col items-center relative mr-1">
                        <div className="h-16 flex flex-col items-center justify-between py-1">
                            <div className="w-1.5 h-[1px] bg-zinc-400" />
                            <div className="w-[1px] h-full bg-zinc-400" />
                            <div className="w-1.5 h-[1px] bg-zinc-400" />
                        </div>
                        <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">
                            {frameDepth.toFixed(2).replace('.', ',')}"
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        {/* Profile Shape */}
                        <div 
                            className="w-14 h-14 bg-zinc-100 border border-zinc-200 shadow-inner"
                            style={{ 
                                clipPath: profileSVG || 'none',
                                background: `linear-gradient(135deg, #f3f4f6 0%, #e2e8f0 100%)`
                            }}
                        />
                        
                        {/* Horizontal Dimension (Width) */}
                        <div className="w-14 relative flex flex-col items-center">
                            <div className="w-full h-4 flex items-center justify-between px-0.5">
                                <div className="h-1.5 w-[1px] bg-zinc-400" />
                                <div className="h-[1px] w-full bg-zinc-400" />
                                <div className="h-1.5 w-[1px] bg-zinc-400" />
                            </div>
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-400 whitespace-nowrap">
                                {frameWidth.toFixed(2).replace('.', ',')}"
                            </span>
                        </div>
                    </div>
                </div>

                {/* Selection indicator could be here or we rely on the color change */}
            </div>

            {/* Content Area (Right) */}
            <div className={`md:w-[45%] p-10 flex flex-col justify-center text-left transition-colors duration-300 ${
                isSelected ? 'bg-[#00a8e8] text-white' : 'bg-zinc-50/70 text-zinc-900 group-hover:bg-zinc-100/80'
            }`}>
                <h3 className={`text-2xl font-black mb-1 tracking-tight ${isSelected ? 'text-white' : 'text-zinc-800'}`}>
                    {name}
                </h3>
                
                <p className={`font-bold mb-8 ${isSelected ? 'text-white/90' : 'text-rose-600'}`}>
                    {isSelected ? `selecionada` : `a partir de R$ ${salePrice.toFixed(2).replace('.', ',')}`}
                </p>

                {features && features.length > 0 && (
                    <ul className="space-y-3">
                        {features.map((feature, i) => (
                            <li key={i} className={`flex items-start gap-3 text-xs font-bold leading-tight ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${isSelected ? 'bg-white/60' : 'bg-zinc-300'}`} />
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </button>
    );
}

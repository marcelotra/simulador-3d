import { FrameData } from '../../store/useSimulatorStore';
import { FrameChevron } from './FrameChevron';

interface FrameCardProps {
    frame: FrameData;
    isSelected: boolean;
    onSelect: (frame: FrameData) => void;
}

export function FrameCard({ frame, isSelected, onSelect }: FrameCardProps) {
    const { name, salePrice, features, frameWidth, frameDepth, profileSVG, profileImageUrl } = frame;

    return (
        <div
            onClick={() => onSelect(frame)}
            className={`
                group w-full flex flex-col md:flex-row rounded-[1.5rem] border transition-all overflow-hidden cursor-pointer
                ${isSelected ? 'border-[#00a8e8] shadow-lg' : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'}
            `}
        >
            {/* Visual Area (Left) - Always White */}
            <div className="md:w-[60%] p-6 bg-white flex items-center justify-between relative min-h-[160px]">
                {/* 3D Chevron View */}
                <div className="flex-1 flex items-center justify-center pr-4">
                    <div className="scale-110">
                        <FrameChevron frame={frame} size={120} />
                    </div>
                </div>

                {/* Profile View (Photo or Drawing) */}
                <div className="w-[140px] h-[120px] relative flex items-center justify-center border-l border-zinc-100 pl-4">
                    {profileImageUrl ? (
                        <img 
                            src={profileImageUrl} 
                            alt="Perfil técnico" 
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <div 
                            className="w-16 h-16 bg-zinc-100 shadow-inner"
                            style={{ 
                                clipPath: profileSVG || 'none',
                                background: `linear-gradient(135deg, #f3f4f6 0%, #e2e8f0 100%)`
                            }}
                        />
                    )}

                    {/* Dimension Arrows (SVG Overlay) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 140 120">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                            </marker>
                        </defs>
                        
                        {/* Profundidade (Vertical) - Seta na esquerda do taco */}
                        <line x1="20" y1="30" x2="20" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" markerStart="url(#arrowhead)" markerEnd="url(#arrowhead)" />
                        <text x="14" y="60" transform="rotate(-90 14,60)" textAnchor="middle" className="text-[10px] fill-zinc-400 font-bold">{frameDepth.toFixed(1)}cm</text>
                        
                        {/* Largura (Horizontal) - Seta abaixo do taco */}
                        <line x1="30" y1="105" x2="110" y2="105" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" markerStart="url(#arrowhead)" markerEnd="url(#arrowhead)" />
                        <text x="70" y="116" textAnchor="middle" className="text-[10px] fill-zinc-400 font-bold">{frameWidth.toFixed(1)}cm</text>
                    </svg>
                </div>
            </div>

            {/* Content Area (Right) - Blue when selected */}
            <div className={`md:w-[40%] p-6 flex flex-col justify-center text-left transition-colors duration-300 ${
                isSelected ? 'bg-[#00a8e8] text-white' : 'bg-[#f8f9fa] text-zinc-900'
            }`}>
                <h3 className={`text-lg font-black mb-1 tracking-tight leading-tight`}>
                    {name}
                </h3>
                
                <p className={`text-sm font-bold mb-4 ${isSelected ? 'text-white/90' : 'text-[#e91e63]'}`}>
                    from ${salePrice.toFixed(2)}
                </p>

                {features && features.length > 0 && (
                    <ul className="space-y-1.5">
                        {features.map((feature, i) => (
                            <li key={i} className={`flex items-start gap-2 text-[11px] font-bold leading-tight ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${isSelected ? 'bg-white/60' : 'bg-zinc-300'}`} />
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

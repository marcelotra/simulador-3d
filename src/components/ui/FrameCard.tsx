import { FrameData } from '../../store/useSimulatorStore';
import { Check } from 'lucide-react';

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
            className={`group w-full flex flex-col md:flex-row bg-white rounded-[2rem] border-2 transition-all overflow-hidden ${
                isSelected 
                    ? 'border-zinc-900 ring-4 ring-zinc-900/5' 
                    : 'border-white hover:border-zinc-200 shadow-sm hover:shadow-md'
            }`}
        >
            {/* Visual Area (Left) */}
            <div className="md:w-1/2 p-6 bg-white flex items-center justify-center relative min-h-[240px]">
                {/* Elbow / Chevron View */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <img 
                        src={elbowUrl || textureUrl} 
                        alt={name} 
                        className="max-w-[80%] max-h-[80%] object-contain transition-transform group-hover:scale-105 duration-500" 
                    />
                </div>

                {/* Profile Drawing (Bottom Right Overlay) */}
                <div className="absolute bottom-6 right-6 flex items-end gap-2 bg-white/40 backdrop-blur-sm p-2 rounded-xl">
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-12 w-0.5 bg-zinc-300 relative">
                            <span className="absolute -left-10 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 rotate-0">
                                {frameDepth}cm
                            </span>
                        </div>
                        {/* Profile Shape */}
                        <div 
                            className="w-10 h-10 bg-zinc-200 border border-zinc-300"
                            style={{ 
                                clipPath: profileSVG || 'none',
                                background: `linear-gradient(135deg, #e4e4e7 0%, #d4d4d8 100%)`
                            }}
                        />
                        <div className="w-10 h-0.5 bg-zinc-300 relative mt-1">
                            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-zinc-400">
                                {frameWidth}cm
                            </span>
                        </div>
                    </div>
                </div>

                {/* Selection Check */}
                {isSelected && (
                    <div className="absolute top-4 left-4 bg-zinc-900 text-white p-1.5 rounded-full z-10">
                        <Check className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Content Area (Right) */}
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-zinc-50/50">
                <h3 className="text-xl font-black text-zinc-900 mb-2">{name}</h3>
                
                <p className="text-rose-600 font-bold mb-6">
                    a partir de R$ {salePrice.toFixed(2).replace('.', ',')}
                </p>

                {features && features.length > 0 && (
                    <ul className="space-y-2">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs font-medium text-zinc-600">
                                <span className="w-1 h-1 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </button>
    );
}

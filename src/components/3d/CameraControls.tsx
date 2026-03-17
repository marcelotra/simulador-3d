import { Camera, Maximize, MoveRight, MoveLeft, MoveDownLeft, MoveUpRight } from 'lucide-react';
import { useSimulatorStore, CameraAngle } from '../../store/useSimulatorStore';

const ANGLES: { id: CameraAngle, label: string, icon: any }[] = [
    { id: 'top-left', label: 'Topo Esq.', icon: MoveDownLeft },
    { id: 'left', label: 'Esquerda', icon: MoveRight },
    { id: 'center', label: 'Centro', icon: Maximize },
    { id: 'right', label: 'Direita', icon: MoveLeft },
    { id: 'bottom-right', label: 'Base Dir.', icon: MoveUpRight },
];

export function CameraControls() {
    const { cameraAngle, setCameraAngle } = useSimulatorStore();

    return (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur pb-2 pt-3 px-2 rounded-2xl shadow-xl border border-zinc-200/50 flex flex-col gap-1.5 items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center mb-1 text-zinc-400">
                    <Camera className="w-4 h-4" />
                </div>
                
                {ANGLES.map(angle => {
                    const active = cameraAngle === angle.id;
                    const Icon = angle.icon;
                    return (
                        <button
                            key={angle.id}
                            onClick={() => setCameraAngle(angle.id)}
                            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all border-2 text-center gap-1 group ${
                                active 
                                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' 
                                    : 'bg-white border-transparent hover:border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-[8px] font-black uppercase tracking-widest px-1 leading-tight">{angle.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

import { Configurator } from '../components/ui/Configurator';
import { Scene } from '../components/3d/Scene';

export function Simulator() {
    return (
        <div className="w-full min-h-screen flex lg:h-screen relative bg-zinc-100 font-sans">
            {/* 3D Canvas Area — adapts to available space */}
            <div className="flex-1 min-h-[50vh] lg:h-full relative">
                <Scene />
            </div>

            {/* Sidebar Panel */}
            <div className="w-full lg:w-[480px] shrink-0 min-h-screen lg:h-screen bg-white border-l border-zinc-200 shadow-xl flex flex-col z-10 px-6 pt-6 pb-0 overflow-y-auto">
                <div className="mb-6 flex items-start gap-3">
                    <img src="/logo_fuse.png" alt="Logo" className="w-10 h-10 object-contain mt-1" />
                    <div>
                        <h1 className="text-lg font-medium tracking-tight text-zinc-900 block font-serif italic">Estúdio 3D</h1>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mt-0.5">Fuse Galeria</p>
                    </div>
                </div>

                <Configurator />
            </div>
        </div>
    );
}


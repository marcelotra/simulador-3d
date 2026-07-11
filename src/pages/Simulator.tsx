import { Configurator } from '../components/ui/Configurator';
import { Scene } from '../components/3d/Scene';

export function Simulator() {
    return (
        <div className="w-full min-h-screen flex lg:h-screen relative bg-zinc-100 font-sans overflow-hidden">
            {/* 3D Canvas Area */}
            <div className="flex-1 min-w-0 overflow-hidden min-h-[50vh] lg:h-full relative z-0">
                <Scene />
            </div>

            {/* Brutalist Sidebar Panel */}
            <div className="w-full lg:w-[380px] shrink-0 min-h-screen lg:h-screen bg-white border-l-2 border-zinc-900 flex flex-col z-10 px-6 pt-6 pb-0 overflow-y-auto relative">
                <div className="mb-6 flex items-start gap-3 pb-4 border-b border-zinc-200">
                    <img src="/logo_fuse.png" alt="Logo" className="w-10 h-10 object-contain mt-1" />
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-zinc-900 block uppercase">Estúdio 3D</h1>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-0.5">Fuse Galeria</p>
                    </div>
                </div>

                <Configurator />
            </div>
        </div>
    );
}


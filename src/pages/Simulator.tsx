import { Configurator } from '../components/ui/Configurator';
import { Scene } from '../components/3d/Scene';

export function Simulator() {
    return (
        <div className="w-full min-h-screen flex lg:h-screen relative bg-zinc-50 font-sans overflow-hidden">
            {/* 3D Canvas Area */}
            <div className="absolute inset-0 z-0">
                <Scene />
            </div>

            {/* Neo-Premium Floating Island Sidebar */}
            <div className="absolute right-4 top-4 bottom-4 w-full lg:w-[420px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 flex flex-col z-10 px-6 pt-6 pb-0 overflow-y-auto">
                <div className="mb-6 flex items-start gap-3 pb-4 border-b border-zinc-100">
                    <img src="/logo_fuse.png" alt="Logo" className="w-10 h-10 object-contain mt-1 drop-shadow-sm" />
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-zinc-900 block font-serif italic">Estúdio 3D</h1>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-0.5">Fuse Galeria</p>
                    </div>
                </div>

                <Configurator />
            </div>
        </div>
    );
}


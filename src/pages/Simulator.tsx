import { Configurator } from '../components/ui/Configurator';
import { Scene } from '../components/3d/Scene';

export function Simulator() {
    return (
        <div className="w-full min-h-screen bg-white font-sans overflow-y-auto">
            <div className="max-w-[1300px] mx-auto px-6 py-10">
                {/* Breadcrumbs */}
                <div className="text-[13px] text-zinc-500 mb-8">
                    Início / Molduras por Medida / Molduras Castanhas / <span className="font-bold text-zinc-900">Moldura Castanha de 1.3 cm de largura</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Side: 3D Scene Area */}
                    <div className="w-full lg:w-[60%] shrink-0 relative">
                        <div className="w-full aspect-[4/3] relative bg-zinc-50 border border-zinc-100 shadow-inner">
                            <Scene />
                        </div>

                        {/* Extra metadata imitating Caixilho */}
                        <div className="mt-6 text-[11px] text-zinc-500 space-y-1">
                            <p>Medidas do seu trabalho: 60x40cm</p>
                            <p>Medidas interiores da moldura: 60x40cm</p>
                            <p>Medidas exteriores aproximadas da moldura: 62x42cm</p>
                            <p>Acessório para pendurar: horizontal</p>
                        </div>
                    </div>

                    {/* Right Side: Configurator Area */}
                    <div className="w-full lg:w-[40%] flex flex-col">
                        <Configurator />
                    </div>
                </div>
            </div>
        </div>
    );
}


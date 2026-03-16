import { Suspense } from 'react';
import { Frame2D } from '../2d/Frame2D';
import { OnboardingHint } from '../ui/OnboardingHint';

export function Scene() {
    return (
        <div className="w-full h-full relative cursor-default bg-[#f4f4f5]">
            <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    Carregando molde...
                </div>
            }>
                <Frame2D />
            </Suspense>

            {/* Onboarding hint overlay */}
            <OnboardingHint />

            {/* UI overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200/50 text-xs text-zinc-500 shadow-sm pointer-events-none">
                Estúdio 2D Fotorealista
            </div>
        </div>
    );
}

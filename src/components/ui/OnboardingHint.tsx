import { useState, useEffect } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

const STORAGE_KEY = 'fuse_onboarding_done';

export function OnboardingHint() {
    const [visible, setVisible] = useState(false);
    const store = useSimulatorStore();

    useEffect(() => {
        // Only show if never dismissed before and user hasn't uploaded an image yet
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) setVisible(true);
    }, []);

    // Auto-hide when user uploads an image or takes action
    useEffect(() => {
        if (store.userImage) dismiss();
    }, [store.userImage]);

    const dismiss = () => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, '1');
    };

    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
            aria-hidden="true"
        >
            {/* Dark overlay with hole effect via radial gradient */}
            <div
                className="absolute inset-0 bg-black/0"
                style={{ pointerEvents: 'none' }}
            />

            {/* Hint card — bottom-center of canvas area */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-onboarding-fade">

                {/* Text bubble */}
                <div
                    className="bg-zinc-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 max-w-xs text-center pointer-events-auto cursor-pointer"
                    onClick={dismiss}
                >
                    <p className="text-sm font-bold leading-snug mb-1">Bem-vindo ao Estúdio 3D</p>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                        Use o painel à direita para configurar dimensões, moldura, papel e muito mais.
                    </p>
                    <span className="mt-3 block text-[10px] text-white/30 uppercase tracking-widest">toque para fechar</span>
                </div>

                {/* Arrow pointing right (toward sidebar) */}
                <div className="flex items-center gap-0 animate-arrow-bounce-x self-end mr-6">
                    <div className="text-white/80 text-sm font-bold whitespace-nowrap bg-zinc-800/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        Configure aqui →
                    </div>
                </div>
            </div>
        </div>
    );
}

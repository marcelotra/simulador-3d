interface StepHintProps {
    text: string;
}

/**
 * Dica contextual animada que aparece abaixo de um botão de etapa.
 * Exibe um texto em estilo cursivo com uma seta animada apontando para cima (↑).
 */
export function StepHint({ text }: StepHintProps) {
    return (
        <div className="flex items-start gap-1.5 px-2 pt-2 animate-onboarding-fade select-none pointer-events-none">
            <span className="text-zinc-400 text-base leading-none animate-arrow-bounce-up mt-0.5">↑</span>
            <p className="text-[12px] text-zinc-400 leading-snug step-hint-text">
                {text}
            </p>
        </div>
    );
}

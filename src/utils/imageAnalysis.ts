/**
 * Utilitários de análise técnica para a Fuse Galeria
 */

export interface AnalysisResult {
    dpi: number;
    qualityLabel: 'Ótima' | 'Boa' | 'Ruim';
    qualityMessage: string;
    aspectRatioDiff: number; // Porcentagem de diferença
    isRatioCompatible: boolean;
    ratioMessage: string;
    suggestedSize?: { width: number; height: number };
}

export function analyzeImage(
    pixelsWidth: number,
    pixelsHeight: number,
    targetWidthCm: number,
    targetHeightCm: number
): AnalysisResult {
    // 1. Cálculo de DPI
    // DPI = Pixels / (Centímetros / 2.54)
    const dpiX = Math.round(pixelsWidth / (targetWidthCm / 2.54));
    const dpiY = Math.round(pixelsHeight / (targetHeightCm / 2.54));
    const dpi = Math.min(dpiX, dpiY);

    let qualityLabel: AnalysisResult['qualityLabel'] = 'Ótima';
    let qualityMessage = `Qualidade de Saída: ${dpi} DPI. A imagem está em excelente resolução nativa para o tamanho solicitado (${targetWidthCm}x${targetHeightCm} cm).`;

    if (dpi < 300 && dpi >= 150) {
        qualityLabel = 'Boa';
        qualityMessage = `Qualidade de Saída: ${dpi} DPI. A imagem possui boa resolução para o tamanho solicitado.`;
    } else if (dpi < 150) {
        qualityLabel = 'Ruim';
        const maxW = Math.round((pixelsWidth * 2.54) / 150);
        const maxH = Math.round((pixelsHeight * 2.54) / 150);

        qualityMessage = `Qualidade de Saída: ${dpi} DPI. Para manter uma qualidade aceitável, sugerimos não exceder ${maxW}x${maxH} cm. Nossos especialistas avaliarão manualmente sua imagem para verificar se é possível imprimir no tamanho desejado sem perda perceptível de nitidez.`;
    }

    // 2. Validação de Proporção
    const pixelRatio = pixelsWidth / pixelsHeight;
    const targetRatio = targetWidthCm / targetHeightCm;
    const ratioDiff = Math.abs(pixelRatio - targetRatio) / pixelRatio;

    // Tolerância de 2% para considerar compatível
    const isRatioCompatible = ratioDiff < 0.02;
    let ratioMessage = "Proporção de Tela compatível com o formato solicitado.";

    if (!isRatioCompatible) {
        ratioMessage = `O formato da foto não coincide com o tamanho solicitado. Você pode CORTAR A IMAGEM para preencher o espaço ou ALTERAR PARA UMA MEDIDA COMPATÍVEL.`;
    }

    return {
        dpi,
        qualityLabel,
        qualityMessage,
        aspectRatioDiff: ratioDiff,
        isRatioCompatible,
        ratioMessage,
        suggestedSize: !isRatioCompatible ? { width: targetWidthCm, height: Math.round(targetWidthCm / pixelRatio) } : undefined
    };
}

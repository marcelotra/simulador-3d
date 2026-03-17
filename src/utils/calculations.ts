import { useSimulatorStore } from '../store/useSimulatorStore';
import { getSegments } from './layout';

export const PIXELS_PER_CM = 10; // 1cm = 10px in 3D WebGL units

// Base costs (in BRL)
const COSTS = {
    framePerMeter: 45.00,
    passepartoutPerSqMeter: 80.00,
    glassStandardPerSqMeter: 50.00,
    glassAntiReflectivePerSqMeter: 120.00,
    printingStandardPerSqMeter: 90.00,
    printingFineArtPerSqMeter: 210.00,
    backingMdfPerSqMeter: 35.00,
    backingFoamPerSqMeter: 75.00,
    baseLaborPerFrame: 15.00 // Reduced per frame when multi
};

export function calculatePrice(state: ReturnType<typeof useSimulatorStore.getState>) {
    const { 
        width, height, passepartoutWidth, glassType, userImage, 
        hasFrame, printType, backingType, paperMargin, quantity,
        splitType, splitColumns, splitGap, splitHeightRatio
    } = state;

    const segments = getSegments(width, height, splitType, splitColumns, splitGap, splitHeightRatio);

    let totalFrameCost = 0;
    let totalPassepartoutCost = 0;
    let totalGlassCost = 0;
    let totalPrintCost = 0;
    let totalBackingCost = 0;
    let totalLabor = 0;

    segments.forEach(seg => {
        // The "paper" size includes the image plus the paper margin
        const paperWidth = seg.w + (paperMargin * 2);
        const paperHeight = seg.h + (paperMargin * 2);

        // Outer dimensions of the glass/passepartout area (if there's a frame/passepartout)
        const totalContentWidth = paperWidth + (passepartoutWidth * 2);
        const totalContentHeight = paperHeight + (passepartoutWidth * 2);

        // Costs
        if (hasFrame) {
            const perimeterMeters = ((totalContentWidth * 2) + (totalContentHeight * 2)) / 100;
            totalFrameCost += perimeterMeters * COSTS.framePerMeter;
        }

        // Areas in square meters
        const totalAreaSqMeters = (totalContentWidth * totalContentHeight) / 10000;
        const paperAreaSqMeters = (paperWidth * paperHeight) / 10000;

        // Passepartout cost
        if (hasFrame && passepartoutWidth > 0) {
            totalPassepartoutCost += (totalAreaSqMeters - paperAreaSqMeters) * COSTS.passepartoutPerSqMeter;
        }

        // Glass cost
        if (hasFrame) {
            if (glassType === 'standard') totalGlassCost += totalAreaSqMeters * COSTS.glassStandardPerSqMeter;
            if (glassType === 'anti-reflective') totalGlassCost += totalAreaSqMeters * COSTS.glassAntiReflectivePerSqMeter;
        }

        // Printing Cost
        let printUnitPrice = COSTS.printingStandardPerSqMeter;
        if (printType.toLowerCase().includes('fine art')) printUnitPrice = COSTS.printingFineArtPerSqMeter;
        totalPrintCost += userImage ? paperAreaSqMeters * printUnitPrice : 0;

        // Backing Cost
        let backingUnitPrice = COSTS.backingMdfPerSqMeter;
        if (backingType.toLowerCase().includes('foam')) backingUnitPrice = COSTS.backingFoamPerSqMeter;
        totalBackingCost += totalAreaSqMeters * backingUnitPrice;

        totalLabor += COSTS.baseLaborPerFrame;
    });

    const subtotal = totalFrameCost + totalPassepartoutCost + totalGlassCost + totalPrintCost + totalBackingCost + totalLabor;
    const qty = quantity ?? 1;

    return {
        frameCost: totalFrameCost,
        passepartoutCost: totalPassepartoutCost,
        glassCost: totalGlassCost,
        printCost: totalPrintCost,
        backingCost: totalBackingCost,
        labor: totalLabor,
        subtotal,
        quantity: qty,
        total: subtotal * qty
    };
}

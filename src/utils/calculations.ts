// Math for the frame simulator 
import { useSimulatorStore } from '../store/useSimulatorStore';

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
    baseLabor: 25.00
};

export function calculatePrice(state: ReturnType<typeof useSimulatorStore.getState>) {
    const { width, height, passepartoutWidth, glassType, userImage, hasFrame, printType, backingType, paperMargin, quantity } = state;

    // The "paper" size includes the image plus the paper margin
    const paperWidth = width + (paperMargin * 2);
    const paperHeight = height + (paperMargin * 2);

    // Outer dimensions of the glass/passepartout area (if there's a frame/passepartout)
    const totalContentWidth = paperWidth + (passepartoutWidth * 2);
    const totalContentHeight = paperHeight + (passepartoutWidth * 2);

    // Costs
    let frameCost = 0;
    if (hasFrame) {
        // Perimeter in meters for frame molding
        const perimeterMeters = ((totalContentWidth * 2) + (totalContentHeight * 2)) / 100;
        frameCost = perimeterMeters * COSTS.framePerMeter;
    }

    // Areas in square meters
    const totalAreaSqMeters = (totalContentWidth * totalContentHeight) / 10000;
    const paperAreaSqMeters = (paperWidth * paperHeight) / 10000;

    // Passepartout cost (only if width > 0)
    const passepartoutCost = (hasFrame && passepartoutWidth > 0)
        ? (totalAreaSqMeters - paperAreaSqMeters) * COSTS.passepartoutPerSqMeter
        : 0;

    // Glass cost
    let glassCost = 0;
    if (hasFrame) {
        if (glassType === 'standard') glassCost = totalAreaSqMeters * COSTS.glassStandardPerSqMeter;
        if (glassType === 'anti-reflective') glassCost = totalAreaSqMeters * COSTS.glassAntiReflectivePerSqMeter;
    }

    // Printing Cost
    let printUnitPrice = COSTS.printingStandardPerSqMeter;
    if (printType.toLowerCase().includes('fine art')) printUnitPrice = COSTS.printingFineArtPerSqMeter;
    const printCost = userImage ? paperAreaSqMeters * printUnitPrice : 0;

    // Backing Cost
    let backingUnitPrice = COSTS.backingMdfPerSqMeter;
    if (backingType.toLowerCase().includes('foam')) backingUnitPrice = COSTS.backingFoamPerSqMeter;
    const backingCost = totalAreaSqMeters * backingUnitPrice;

    const subtotal = frameCost + passepartoutCost + glassCost + printCost + backingCost + COSTS.baseLabor;
    const qty = quantity ?? 1;

    return {
        frameCost,
        passepartoutCost,
        glassCost,
        printCost,
        backingCost,
        labor: COSTS.baseLabor,
        subtotal,
        quantity: qty,
        total: subtotal * qty
    };
}

import type {
    FillInstruction,
    GraphicsContext,
} from '../../GraphicsContext';

/**
 * Determines if subpaths represent nested shapes or multiple holes pattern.
 * @param subpathsWithArea - Array of subpaths with their calculated areas
 * @returns True if nested pattern, false if multiple holes pattern
 * @internal
 */
export function checkForNestedPattern(subpathsWithArea: Array<{path: string, area: number}>): boolean
{
    if (subpathsWithArea.length <= 2)
    {
        return true;
    }

    const areas = subpathsWithArea.map((s) => s.area).sort((a, b) => b - a);

    const [largestArea, secondArea] = areas;
    const smallestArea = areas[areas.length - 1];

    const largestToSecondRatio = largestArea / secondArea;
    const secondToSmallestRatio = secondArea / smallestArea;

    // If the largest shape is significantly bigger than the second (3x+)
    // AND the smaller shapes are similar in size (2x or less difference),
    // it suggests multiple holes pattern rather than nested shapes
    if (largestToSecondRatio > 3 && secondToSmallestRatio < 2)
    {
        return false; // Multiple holes
    }

    return true; // Default to nested
}

/**
 * Gets fill instruction data from a graphics context.
 * @param context - The graphics context
 * @param index - Index of the fill instruction (default: 0)
 * @returns The fill instruction data
 * @throws Error if instruction at index is not a fill instruction
 * @internal
 */
export function getFillInstructionData(context: GraphicsContext, index: number = 0)
{
    const instruction = context.instructions[index];

    if (!instruction || instruction.action !== 'fill')
    {
        throw new Error(`Expected fill instruction at index ${index}, got ${instruction?.action || 'undefined'}`);
    }

    return (instruction as FillInstruction).data;
}

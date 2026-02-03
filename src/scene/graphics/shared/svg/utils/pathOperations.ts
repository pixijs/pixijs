import { GraphicsPath } from '../../path/GraphicsPath';

/**
 * Extracts individual subpaths from SVG path data by splitting on Move commands.
 * @param pathData - The SVG path data string
 * @returns Array of subpath strings
 * @internal
 */
export function extractSubpaths(pathData: string): string[]
{
    // Split on Move commands (M or m) to get individual subpaths
    const parts = pathData.split(/(?=[Mm])/);
    const subpaths = parts.filter((part) => part.trim().length > 0);

    return subpaths;
}

/**
 * Calculates the area of a path using bounding box estimation.
 * @param pathData - The SVG path data string
 * @returns The estimated area of the path
 * @internal
 */
export function calculatePathArea(pathData: string): number
{
    const coords = pathData.match(/[-+]?[0-9]*\.?[0-9]+/g);

    if (!coords || coords.length < 4) return 0;

    const numbers = coords.map(Number);
    const xs = [];
    const ys = [];

    for (let i = 0; i < numbers.length; i += 2)
    {
        if (i + 1 < numbers.length)
        {
            xs.push(numbers[i]);
            ys.push(numbers[i + 1]);
        }
    }

    if (xs.length === 0 || ys.length === 0) return 0;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const area = (maxX - minX) * (maxY - minY);

    return area;
}

/**
 * Parses SVG path data and appends instructions to a GraphicsPath.
 * @param pathData - The SVG path data string
 * @param graphicsPath - The GraphicsPath to append instructions to
 * @internal
 */
export function appendSVGPath(pathData: string, graphicsPath: GraphicsPath): void
{
    const tempPath = new GraphicsPath(pathData, false);

    for (const instruction of tempPath.instructions)
    {
        graphicsPath.instructions.push(instruction);
    }
}

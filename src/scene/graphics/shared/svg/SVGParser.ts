import { warn } from '../../../../utils/logging/warn';
import { GraphicsPath } from '../path/GraphicsPath';
import { parseSVGDefinitions } from './parseSVGDefinitions';
import { parseSVGFloatAttribute } from './parseSVGFloatAttribute';
import { parseSVGStyle } from './parseSVGStyle';

import type { FillGradient } from '../fill/FillGradient';
import type { FillStyle, StrokeStyle } from '../FillTypes';
import type {
    FillInstruction,
    GraphicsContext,
} from '../GraphicsContext';

/**
 * Represents a session for SVG parsing. Contains the current state and resources needed during parsing.
 * @internal
 */
export interface Session
{
    /** The graphics context to render to */
    context: GraphicsContext;
    /** The current path being constructed */
    path: GraphicsPath;
    /** Map of definitions by id */
    defs: Record<string, FillGradient>;
}

/**
 * Parses an SVG element or string and renders it to a graphics context.
 * Handles both SVG strings and SVG DOM elements as input.
 * @param svg - The SVG content to parse, either as a string or element
 * @param graphicsContext - Optional graphics context to render to
 * @returns The graphics context with the SVG rendered into it
 * @internal
 */
export function SVGParser(
    svg: string | SVGElement | SVGSVGElement,
    graphicsContext?: GraphicsContext
): GraphicsContext
{
    // Convert string input to SVG element
    if (typeof svg === 'string')
    {
        const div = document.createElement('div');

        div.innerHTML = svg.trim();
        svg = div.querySelector('svg') as SVGElement;
    }

    // Initialize parsing session
    const session = {
        context: graphicsContext,
        defs: {},
        path: new GraphicsPath(),
    };

    // Parse definitions (gradients, etc) first
    parseSVGDefinitions(svg, session);

    // Process all child elements except defs
    const children = svg.children;

    const { fillStyle, strokeStyle } = parseSVGStyle(svg, session);

    for (let i = 0; i < children.length; i++)
    {
        const child = children[i] as SVGElement;

        if (child.nodeName.toLowerCase() === 'defs') continue;
        renderChildren(child, session, fillStyle, strokeStyle);
    }

    return graphicsContext;
}

/**
 * Recursively renders SVG elements and their children.
 * Handles styling inheritance and different SVG shape types.
 * @param svg - The SVG element to render
 * @param session - The current parsing session
 * @param fillStyle - The inherited fill style
 * @param strokeStyle - The inherited stroke style
 */
function renderChildren(svg: SVGElement, session: Session, fillStyle: FillStyle, strokeStyle: StrokeStyle): void
{
    const children = svg.children;

    // Parse element's style and merge with inherited styles
    const { fillStyle: f1, strokeStyle: s1 } = parseSVGStyle(svg, session);

    if (f1 && fillStyle)
    {
        fillStyle = { ...fillStyle, ...f1 };
    }
    else if (f1)
    {
        fillStyle = f1;
    }

    if (s1 && strokeStyle)
    {
        strokeStyle = { ...strokeStyle, ...s1 };
    }
    else if (s1)
    {
        strokeStyle = s1;
    }

    const noStyle = !fillStyle && !strokeStyle;

    // Default to black fill if no styles specified
    if (noStyle)
    {
        fillStyle = { color: 0 };
    }

    // Variables for shape attributes
    let x;
    let y;
    let x1;
    let y1;
    let x2;
    let y2;
    let cx;
    let cy;
    let r;
    let rx;
    let ry;
    let points;
    let pointsString;
    let d;
    let graphicsPath;
    let width;
    let height;

    // Handle different SVG element types
    switch (svg.nodeName.toLowerCase())
    {
        case 'path':
        {
            d = svg.getAttribute('d') as string;

            const fillRule = svg.getAttribute('fill-rule') as string;

            const subpaths = extractSubpaths(d);
            const hasExplicitEvenodd = fillRule === 'evenodd';
            const hasMultipleSubpaths = subpaths.length > 1;

            const shouldProcessHoles = hasExplicitEvenodd && hasMultipleSubpaths;

            if (shouldProcessHoles)
            {
                const subpathsWithArea = subpaths.map((subpath) => ({
                    path: subpath,
                    area: calculatePathArea(subpath)
                }));

                subpathsWithArea.sort((a, b) => b.area - a.area);

                // For complex cases, prefer multiple holes approach
                const useMultipleHolesApproach = subpaths.length > 3 || !checkForNestedPattern(subpathsWithArea);

                if (useMultipleHolesApproach)
                {
                    // Multiple holes approach: first (largest) is fill, rest are holes
                    for (let i = 0; i < subpathsWithArea.length; i++)
                    {
                        const subpath = subpathsWithArea[i];
                        const isMainShape = i === 0;

                        session.context.beginPath();
                        const newPath = new GraphicsPath(undefined, true); // Always use evenodd for hole processing

                        parseSVGPath(subpath.path, newPath);
                        session.context.path(newPath);

                        if (isMainShape)
                        {
                            if (fillStyle) session.context.fill(fillStyle);
                            if (strokeStyle) session.context.stroke(strokeStyle);
                        }
                        else
                        {
                            session.context.cut();
                        }
                    }
                }
                else
                {
                    // Nested holes approach: alternate between fill and cut
                    for (let i = 0; i < subpathsWithArea.length; i++)
                    {
                        const subpath = subpathsWithArea[i];
                        const isHole = i % 2 === 1; // Odd indices are holes

                        session.context.beginPath();
                        const newPath = new GraphicsPath(undefined, true); // Always use evenodd for hole processing

                        parseSVGPath(subpath.path, newPath);
                        session.context.path(newPath);

                        if (isHole)
                        {
                            session.context.cut();
                        }
                        else
                        {
                            if (fillStyle) session.context.fill(fillStyle);
                            if (strokeStyle) session.context.stroke(strokeStyle);
                        }
                    }
                }
            }
            else
            {
                const useEvenoddForGraphicsPath = fillRule ? (fillRule === 'evenodd') : true;

                graphicsPath = new GraphicsPath(d, useEvenoddForGraphicsPath);
                session.context.path(graphicsPath);
                if (fillStyle) session.context.fill(fillStyle);
                if (strokeStyle) session.context.stroke(strokeStyle);
            }
            break;
        }

        case 'circle':
            cx = parseSVGFloatAttribute(svg, 'cx', 0);
            cy = parseSVGFloatAttribute(svg, 'cy', 0);
            r = parseSVGFloatAttribute(svg, 'r', 0);
            session.context.ellipse(cx, cy, r, r);
            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);
            break;

        case 'rect':
            x = parseSVGFloatAttribute(svg, 'x', 0);
            y = parseSVGFloatAttribute(svg, 'y', 0);
            width = parseSVGFloatAttribute(svg, 'width', 0);
            height = parseSVGFloatAttribute(svg, 'height', 0);
            rx = parseSVGFloatAttribute(svg, 'rx', 0);
            ry = parseSVGFloatAttribute(svg, 'ry', 0);

            if (rx || ry)
            {
                session.context.roundRect(x, y, width, height, rx || ry);
            }
            else
            {
                session.context.rect(x, y, width, height);
            }

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);
            break;

        case 'ellipse':
            cx = parseSVGFloatAttribute(svg, 'cx', 0);
            cy = parseSVGFloatAttribute(svg, 'cy', 0);
            rx = parseSVGFloatAttribute(svg, 'rx', 0);
            ry = parseSVGFloatAttribute(svg, 'ry', 0);

            session.context.beginPath();
            session.context.ellipse(cx, cy, rx, ry);

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);
            break;

        case 'line':
            x1 = parseSVGFloatAttribute(svg, 'x1', 0);
            y1 = parseSVGFloatAttribute(svg, 'y1', 0);
            x2 = parseSVGFloatAttribute(svg, 'x2', 0);
            y2 = parseSVGFloatAttribute(svg, 'y2', 0);

            session.context.beginPath();
            session.context.moveTo(x1, y1);
            session.context.lineTo(x2, y2);

            if (strokeStyle) session.context.stroke(strokeStyle);
            break;

        case 'polygon':
            pointsString = svg.getAttribute('points') as string;
            points = pointsString.match(/\d+/g).map((n) => parseInt(n, 10));
            session.context.poly(points, true);
            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);
            break;

        case 'polyline':
            pointsString = svg.getAttribute('points') as string;
            points = pointsString.match(/\d+/g).map((n) => parseInt(n, 10));
            session.context.poly(points, false);
            if (strokeStyle) session.context.stroke(strokeStyle);
            break;

        // Group elements - just process children
        case 'g':
        case 'svg':
            break;

        default: {
            // Log unsupported elements
            warn(`[SVG parser] <${svg.nodeName}> elements unsupported`);
            break;
        }
    }

    if (noStyle)
    {
        fillStyle = null;
    }

    // Recursively process child elements
    for (let i = 0; i < children.length; i++)
    {
        renderChildren(children[i] as SVGElement, session, fillStyle, strokeStyle);
    }
}

/**
 * Extracts individual subpaths from a SVG path data string.
 * Splits the path data by Move commands (M or m) to get separate subpaths.
 * @param pathData - The SVG path data string
 * @returns An array of subpath strings
 */
function extractSubpaths(pathData: string): string[]
{
    // Split on Move commands (M or m) to get individual subpaths
    const parts = pathData.split(/(?=[Mm])/);
    const subpaths = parts.filter((part) => part.trim().length > 0);

    return subpaths;
}

/**
 * Calculates the area of a path defined by its SVG path data.
 * Uses a simple bounding box approach to estimate the area.
 * @param pathData - The SVG path data string
 * @returns The estimated area of the path
 */
function calculatePathArea(pathData: string): number
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
 * Checks if the subpaths represent a nested pattern or multiple holes.
 * Uses area comparison to determine if shapes are nested or similar-sized.
 * @param subpathsWithArea - Array of subpaths with their calculated areas
 * @returns True if nested, false if multiple holes
 */
function checkForNestedPattern(subpathsWithArea: Array<{path: string, area: number}>): boolean
{
    if (subpathsWithArea.length <= 2)
    {
        return true;
    }

    const areas = subpathsWithArea.map((s) => s.area).sort((a, b) => b - a);

    const largestArea = areas[0];
    const secondArea = areas[1];
    const smallestArea = areas[areas.length - 1];

    const largestToSecondRatio = largestArea / secondArea;
    const secondToSmallestRatio = secondArea / smallestArea;

    if (largestToSecondRatio > 3 && secondToSmallestRatio < 2)
    {
        return false; // Multiple holes
    }

    return true; // Default to nested
}

/**
 * Parses an SVG path data string and appends the instructions to the provided GraphicsPath.
 * Uses the existing GraphicsPath string parsing capability.
 * @param pathData - The SVG path data string
 * @param graphicsPath - The GraphicsPath to append instructions to
 * @internal
 */
function parseSVGPath(pathData: string, graphicsPath: GraphicsPath): void
{
    const tempPath = new GraphicsPath(pathData, false);

    for (const instruction of tempPath.instructions)
    {
        graphicsPath.instructions.push(instruction);
    }
}

/**
 * Safely retrieves fill instruction data from the graphics context.
 * @param context - The graphics context containing instructions
 * @param index - Optional index to get a specific fill instruction
 * @returns The fill instruction data
 * @throws Error if the instruction at the given index is not a fill instruction
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

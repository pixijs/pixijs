import { Color } from '../../../../color/Color';
import { FillGradient } from '../fill/FillGradient';
import { parseSVGFloatAttribute } from './parseSVGFloatAttribute';

import type { ColorSource } from '../../../../color/Color';
import type { TextureSpace } from '../FillTypes';
import type { Session } from './SVGParser';

/**
 * Parses SVG gradient definitions and stores them in the session for later use.
 * Supports both linear and radial gradients.
 * @param svg - The root SVG element to parse definitions from
 * @param session - The parsing session to store definitions in
 * @internal
 */
export function parseSVGDefinitions(svg: SVGElement, session: Session): void
{
    // Find all <defs> elements in the SVG
    const definitions = svg.querySelectorAll('defs');

    // Process each <defs> element
    for (let i = 0; i < definitions.length; i++)
    {
        const definition = definitions[i];

        // Process each child element in the <defs>
        for (let j = 0; j < definition.children.length; j++)
        {
            const child = definition.children[j];

            // Handle different types of gradient definitions
            switch (child.nodeName.toLowerCase())
            {
                case 'lineargradient':
                    // Store the parsed linear gradient in the session defs using the gradient's ID
                    session.defs[child.id] = parseLinearGradient(child as SVGElement);
                    break;
                case 'radialgradient':
                    session.defs[child.id] = parseRadialGradient(child as SVGElement);
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * Parses a gradient geometry attribute, resolving percentages to the 0-1 range.
 * SVG allows gradient coordinates to be expressed as percentages (eg `cx="50%"`),
 * which matches the normalized space used by `objectBoundingBox` gradients.
 *
 * Note that under `userSpaceOnUse` percentages are relative to the viewport, which
 * is not known here - those are still resolved as a 0-1 fraction.
 * @param svg - The gradient element to read the attribute from
 * @param id - The name of the attribute to parse (eg 'cx', 'x1')
 * @param defaultValue - The value to use if the attribute is missing or invalid
 * @returns The parsed value
 */
function parseGradientCoordinate(svg: SVGElement, id: string, defaultValue: number): number
{
    const value = svg.getAttribute(id);

    if (value?.trim().endsWith('%'))
    {
        const percentage = Number(value.trim().slice(0, -1));

        return Number.isNaN(percentage) ? defaultValue : percentage / 100;
    }

    return parseSVGFloatAttribute(svg, id, defaultValue);
}

/**
 * Maps an SVG `gradientUnits` attribute to the texture space used by FillGradient.
 * @param svg - The gradient element to read the attribute from
 * @returns 'local' for `objectBoundingBox` (the SVG default), 'global' otherwise
 */
function parseGradientTextureSpace(svg: SVGElement): TextureSpace
{
    return (svg.getAttribute('gradientUnits') || 'objectBoundingBox') === 'objectBoundingBox' ? 'local' : 'global';
}

/**
 * Parses the `<stop>` children of a gradient element into color stops.
 * @param svg - The gradient element to parse the stops from
 * @returns The color stops in the order they are declared
 */
function parseGradientColorStops(svg: SVGElement): { offset: number, color: ColorSource }[]
{
    const colorStops: { offset: number, color: ColorSource }[] = [];

    for (let i = 0; i < svg.children.length; i++)
    {
        const stop = svg.children[i] as SVGElement;

        // Get stop position (0-1) and color
        const offset = parseGradientCoordinate(stop, 'offset', 0);
        const color = Color.shared.setValue(stop.getAttribute('stop-color')).toNumber();

        colorStops.push({ offset, color });
    }

    return colorStops;
}

/**
 * Parses an SVG linear gradient element into a FillGradient.
 * @param child - The SVG linear gradient element to parse
 * @returns A FillGradient configured based on the SVG element
 */
function parseLinearGradient(child: SVGElement): FillGradient
{
    // Parse the gradient vector coordinates (defaults: horizontal line from 0 to 1)
    const x0 = parseGradientCoordinate(child, 'x1', 0);
    const y0 = parseGradientCoordinate(child, 'y1', 0);
    const x1 = parseGradientCoordinate(child, 'x2', 1);
    const y1 = parseGradientCoordinate(child, 'y2', 0);

    return new FillGradient({
        type: 'linear',
        start: { x: x0, y: y0 },
        end: { x: x1, y: y1 },
        textureSpace: parseGradientTextureSpace(child),
        colorStops: parseGradientColorStops(child)
    });
}

/**
 * Parses an SVG radial gradient element into a FillGradient.
 *
 * SVG describes a radial gradient with two circles: the outer circle (`cx`, `cy`, `r`)
 * where the gradient ends, and the focal circle (`fx`, `fy`, `fr`) where it begins.
 * These map onto the outer and inner circles of a FillGradient. The SVG defaults
 * (all 50%, with `fr` at 0 and the focal point falling back to the outer center)
 * line up with the FillGradient radial defaults.
 * @param child - The SVG radial gradient element to parse
 * @returns A FillGradient configured based on the SVG element
 */
function parseRadialGradient(child: SVGElement): FillGradient
{
    // The outer circle, where the gradient ends
    const cx = parseGradientCoordinate(child, 'cx', 0.5);
    const cy = parseGradientCoordinate(child, 'cy', 0.5);
    const r = parseGradientCoordinate(child, 'r', 0.5);

    // The focal circle, where the gradient begins - defaults to the center of the outer circle
    const fx = parseGradientCoordinate(child, 'fx', cx);
    const fy = parseGradientCoordinate(child, 'fy', cy);
    const fr = parseGradientCoordinate(child, 'fr', 0);

    return new FillGradient({
        type: 'radial',
        center: { x: fx, y: fy },
        innerRadius: fr,
        outerCenter: { x: cx, y: cy },
        outerRadius: r,
        textureSpace: parseGradientTextureSpace(child),
        colorStops: parseGradientColorStops(child)
    });
}

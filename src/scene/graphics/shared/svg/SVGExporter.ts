import { GraphicsContext } from '../GraphicsContext';
import { SVGDefsCollector } from './buildSVGDefinitions';
import { buildSVGPath } from './buildSVGPath';
import { buildSVGFillAttributes, buildSVGStrokeAttributes } from './buildSVGStyle';

import type { Graphics } from '../Graphics';
import type { FillInstruction, GraphicsInstructions, StrokeInstruction } from '../GraphicsContext';

/**
 * Converts a Graphics object or GraphicsContext into an SVG string.
 *
 * This is a pure function — it reads from the context's instructions and
 * returns a self-contained SVG document string. Texture instructions are
 * skipped since they have no SVG equivalent.
 * @param source - A Graphics instance or a GraphicsContext.
 * @param precision - Decimal places for SVG coordinates (default 2).
 * @returns A complete SVG document string.
 * @category scene
 * @standard
 */
export function graphicsContextToSvg(source: Graphics | GraphicsContext, precision = 2): string
{
    const context = source instanceof GraphicsContext
        ? source
        : (source as Graphics).context;

    const defs = new SVGDefsCollector();
    const elements: string[] = [];
    const instructions = context.instructions;

    let i = 0;

    while (i < instructions.length)
    {
        const inst = instructions[i] as GraphicsInstructions;

        switch (inst.action)
        {
            case 'fill':
            {
                const fillInst = inst as FillInstruction;
                const hasHole = !!fillInst.data.hole;
                // Hole paths are flattened to polylines because the reimport side estimates
                // subpath area from raw number extraction; arc flag values would otherwise
                // inflate the bbox and scramble the fill/hole ordering.
                const d = hasHole
                    ? buildSVGPath(fillInst.data.path, precision) + buildSVGPath(fillInst.data.hole, precision, true)
                    : buildSVGPath(fillInst.data.path, precision);
                const fillAttrs = buildSVGFillAttributes(fillInst.data.style, defs);
                const rule = hasHole ? ' fill-rule="evenodd"' : '';

                elements.push(`<path d="${d}" ${fillAttrs}${rule}/>`);
                break;
            }

            case 'stroke':
            {
                const strokeInst = inst as StrokeInstruction;
                let pathD = buildSVGPath(strokeInst.data.path, precision);

                if (strokeInst.data.hole)
                {
                    pathD += buildSVGPath(strokeInst.data.hole, precision, true);
                }

                const strokeAttrs = buildSVGStrokeAttributes(strokeInst.data.style, defs);

                elements.push(`<path d="${pathD}" ${strokeAttrs}/>`);
                break;
            }

            case 'texture':
                break;
        }

        i++;
    }

    const bounds = context.bounds;
    const x = parseFloat(bounds.minX.toFixed(precision));
    const y = parseFloat(bounds.minY.toFixed(precision));
    const w = parseFloat((bounds.maxX - bounds.minX).toFixed(precision));
    const h = parseFloat((bounds.maxY - bounds.minY).toFixed(precision));

    const defsBlock = defs.build();
    const body = elements.join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">${
        defsBlock
    }${body
    }</svg>`;
}

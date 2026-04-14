import { Color } from '../../../../color/Color';
import { FillGradient } from '../fill/FillGradient';

import type { ConvertedFillStyle } from '../FillTypes';

/**
 * Collects gradient/pattern definitions encountered during SVG export.
 * After all elements are processed, call `build()` to emit the `<defs>` block.
 * @internal
 */
export class SVGDefsCollector
{
    private readonly _gradients: { id: string, gradient: FillGradient, textureSpace: string }[] = [];
    private _nextId = 0;

    /**
     * Registers a gradient from a fill/stroke style and returns a `url(#id)` reference.
     * If the style has no gradient, returns `null`.
     * @param style
     */
    public addStyle(style: ConvertedFillStyle): string | null
    {
        if (!(style.fill instanceof FillGradient)) return null;

        const id = `pixi-grad-${this._nextId++}`;

        this._gradients.push({
            id,
            gradient: style.fill,
            textureSpace: style.textureSpace ?? 'local',
        });

        return `url(#${id})`;
    }

    /** Renders the collected definitions as an SVG `<defs>` string. */
    public build(): string
    {
        if (this._gradients.length === 0) return '';

        const parts: string[] = ['<defs>'];

        for (const { id, gradient, textureSpace } of this._gradients)
        {
            const gradientUnits = textureSpace === 'global'
                ? 'userSpaceOnUse'
                : 'objectBoundingBox';

            const stops = buildColorStops(gradient.colorStops);

            if (gradient.type === 'radial')
            {
                const cx = gradient.outerCenter?.x ?? 0.5;
                const cy = gradient.outerCenter?.y ?? 0.5;
                const r = gradient.outerRadius ?? 0.5;
                const fx = gradient.center?.x ?? cx;
                const fy = gradient.center?.y ?? cy;

                parts.push(
                    `<radialGradient id="${id}" gradientUnits="${gradientUnits}"`
                    + ` cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">`,
                    stops,
                    '</radialGradient>'
                );
            }
            else
            {
                const x1 = gradient.start?.x ?? 0;
                const y1 = gradient.start?.y ?? 0;
                const x2 = gradient.end?.x ?? 1;
                const y2 = gradient.end?.y ?? 0;

                parts.push(
                    `<linearGradient id="${id}" gradientUnits="${gradientUnits}"`
                    + ` x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">`,
                    stops,
                    '</linearGradient>'
                );
            }
        }

        parts.push('</defs>');

        return parts.join('');
    }
}

function buildColorStops(colorStops: { offset: number, color: any }[]): string
{
    return colorStops
        .map((stop) =>
        {
            const hex = Color.shared.setValue(stop.color).toHex();

            return `<stop offset="${stop.offset}" stop-color="${hex}"/>`;
        })
        .join('');
}

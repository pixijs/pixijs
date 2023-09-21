import { mix } from '../manipulate/mix';

import type { Colord } from '../colord';
import type { Plugin } from '../extend';
import type { AnyColor } from '../types';

declare module '../colord'
{
    interface Colord
    {
    /** Produces a mixture of two colors through CIE LAB color space and returns a new Colord instance. */
        mix(color2: AnyColor | Colord, ratio?: number): Colord;

        /** Generates a tints palette based on original color. */
        tints(count?: number): Colord[];

        /** Generates a shades palette based on original color. */
        shades(count?: number): Colord[];

        /** Generates a tones palette based on original color. */
        tones(count?: number): Colord[];
    }
}

/**
 * A plugin adding a color mixing utilities.
 * @param ColordClass
 */
const mixPlugin: Plugin = (ColordClass): void =>
{
    ColordClass.prototype.mix = function (color2, ratio = 0.5)
    {
        const instance2 = color2 instanceof ColordClass ? color2 : new ColordClass(color2);

        const mixture = mix(this.toRgb(), instance2.toRgb(), ratio);

        return new ColordClass(mixture);
    };

    /**
     * Generate a palette from mixing a source color with another.
     * @param source
     * @param hex
     * @param count
     */
    function mixPalette(source: Colord, hex: string, count = 5): Colord[]
    {
        const palette = [];
        const step = 1 / (count - 1);

        for (let i = 0; i <= count - 1; i++)
        {
            palette.push(source.mix(hex, step * i));
        }

        return palette;
    }

    ColordClass.prototype.tints = function (count)
    {
        return mixPalette(this, '#fff', count);
    };

    ColordClass.prototype.shades = function (count)
    {
        return mixPalette(this, '#000', count);
    };

    ColordClass.prototype.tones = function (count)
    {
        return mixPalette(this, '#808080', count);
    };
};

export default mixPlugin;

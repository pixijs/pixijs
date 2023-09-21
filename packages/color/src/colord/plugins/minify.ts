import { round } from '../helpers';

import type { Colord } from '../colord';
import type { Plugin } from '../extend';

interface MinificationOptions
{
    hex?: boolean;
    alphaHex?: boolean;
    rgb?: boolean;
    hsl?: boolean;
    name?: boolean;
    transparent?: boolean;
}

declare module '../colord'
{
    interface Colord
    {
    /** Returns the shortest string representation of the color */
        minify(options?: MinificationOptions): string;
    }
}

/**
 * A plugin adding a color minification utilities.
 * @param ColordClass
 */
const minifyPlugin: Plugin = (ColordClass): void =>
{
    // Finds the shortest hex representation
    const minifyHex = (instance: Colord): string | null =>
    {
        const hex = instance.toHex();
        const alpha = instance.alpha();
        const [, r1, r2, g1, g2, b1, b2, a1, a2] = hex.split('');

        // Make sure conversion is lossless
        if (alpha > 0 && alpha < 1 && round(parseInt(a1 + a2, 16) / 255, 2) !== alpha) return null;

        // Check if the string can be shorten
        if (r1 === r2 && g1 === g2 && b1 === b2)
        {
            if (alpha === 1)
            {
                // Express as 3 digit hexadecimal string if the color doesn't have an alpha channel
                return `#${r1}${g1}${b1}`;
            }
            else if (a1 === a2)
            {
                // Format 4 digit hex
                return `#${r1}${g1}${b1}${a1}`;
            }
        }

        return hex;
    };

    // Returns the shortest string in array
    const findShortestString = (variants: string[]): string =>
    {
        let shortest = variants[0];

        for (let index = 1; index < variants.length; index++)
        {
            if (variants[index].length < shortest.length) shortest = variants[index];
        }

        return shortest;
    };

    // Removes leading zero before floating point if necessary
    const shortenNumber = (number: number): string | number =>
    {
        if (number > 0 && number < 1) return number.toString().replace('0.', '.');

        return number;
    };

    // Define new public method
    ColordClass.prototype.minify = function (options: MinificationOptions = {})
    {
        const rgb = this.toRgb();
        const r = shortenNumber(rgb.r);
        const g = shortenNumber(rgb.g);
        const b = shortenNumber(rgb.b);

        const hsl = this.toHsl();
        const h = shortenNumber(hsl.h);
        const s = shortenNumber(hsl.s);
        const l = shortenNumber(hsl.l);

        const a = shortenNumber(this.alpha());

        const defaults: MinificationOptions = {
            hex: true,
            rgb: true,
            hsl: true,
        };

        const settings: MinificationOptions = Object.assign(defaults, options);

        const variants: string[] = [];

        // #rrggbb, #rrggbbaa, #rgb or #rgba
        if (settings.hex && (a === 1 || settings.alphaHex))
        {
            const hex = minifyHex(this);

            if (hex) variants.push(hex);
        }

        // rgb() functional notation with no spaces
        if (settings.rgb)
        {
            variants.push(a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`);
        }

        // hsl() functional notation with no spaces
        if (settings.hsl)
        {
            variants.push(a === 1 ? `hsl(${h},${s}%,${l}%)` : `hsla(${h},${s}%,${l}%,${a})`);
        }

        if (settings.transparent && r === 0 && g === 0 && b === 0 && a === 0)
        {
            // Convert to transparent keyword if this option is enabled
            variants.push('transparent');
        }
        else if (a === 1 && settings.name && typeof this.toName === 'function')
        {
            // CSS color keyword if "names" plugin is installed
            const name = this.toName();

            if (name) variants.push(name);
        }

        return findShortestString(variants);
    };
};

export default minifyPlugin;

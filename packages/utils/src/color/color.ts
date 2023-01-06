import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';

import type { AnyColor } from 'colord';
import type { Color } from '@pixi/utils';

extend([cmykPlugin, namesPlugin]);

/**
 * Converts a color value to an [R,G,B,A] array of normalized values (numbers from 0.0 to 1.0).
 * @example
 * import { utils } from 'pixi.js';
 * utils.color2rgba('red'); // [1, 0, 0, 1]
 * utils.color2rgba(0xff0000); // [1, 0, 0, 1]
 * utils.color2rgba('ff0000'); // [1, 0, 0, 1]
 * utils.color2rgba('#f00'); // [1, 0, 0, 1]
 * utils.color2rgba([255, 0, 0, 0.5]); // [1, 0, 0, 0.5]
 * utils.color2rgba('rgb(255, 0, 0, 0.5)'); // [1, 0, 0, 0.5]
 * utils.color2rgba({h: 0, s: 100, l: 50, a: 0.5}); // [1, 0, 0, 0.5]
 * utils.color2rgba({h: 0, s: 100, v: 100, a: 0.5}); // [1, 0, 0, 0.5]
 * utils.color2rgba({c: 0, m: 100, y: 100, k: 0, a: 0.5}); // [1, 0, 0, 0.5]
 * @memberof PIXI.utils
 * @function color2rgba
 * @param {Color} value
 * @throws Throws an error if unable to convert value.
 * @returns {number[]} [R,G,B,A] array of normalized values
 */
export function color2rgba(value: Color): number[]
{
    if (Array.isArray(value) && value.length >= 3)
    {
        const r = value[0] / 255;
        const g = value[1] / 255;
        const b = value[2] / 255;
        const a = value.length > 3 ? value[3] : 1.0;

        return [r, g, b, a];
    }
    else if (value instanceof Float32Array)
    {
        return color2rgba(Array.from(value));
    }
    else if (typeof value === 'string' || typeof value === 'object')
    {
        if (typeof value === 'string' && isHexString(value) && !value.startsWith('#'))
        {
            value = `#${value}`;
        }

        const color = colord(value as AnyColor);

        if (!color.isValid())
        {
            throw new Error(`Unable to convert color "${value}" to RGBA`);
        }

        const { r, g, b, a } = color.rgba;

        return [r / 255, g / 255, b / 255, a];
    }
    else if (typeof value === 'number' && isHexNumber(value))
    {
        const rgba = [0, 0, 0, 1];

        rgba[0] = ((value >> 16) & 0xFF);
        rgba[1] = ((value >> 8) & 0xFF);
        rgba[2] = (value & 0xFF);

        rgba[0] /= 255;
        rgba[1] /= 255;
        rgba[2] /= 255;

        return rgba;
    }

    throw new Error(`Unable to convert color "${value}" to RGBA`);
}

function isHexNumber(value: number): boolean
{
    return value >= 0 && value <= 0xffffff;
}

function isHexString(value: string): boolean
{
    const re = /^#?([a-f0-9]{3}){1,2}([a-f0-9]{2})?$/i;

    return re.test(value);
}

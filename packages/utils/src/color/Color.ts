import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';

import type {
    AnyColor,
    HslaColor,
    HslColor,
    HsvaColor,
    HsvColor,
    RgbaColor,
    RgbColor,
} from 'colord/types';

extend([namesPlugin]);

/** Different possible value types for Color class */
export type ColorSource = string | number | number[] | Float32Array
| HslColor | HslaColor | HsvColor | HsvaColor | RgbColor | RgbaColor;

/**
 * Converts a color value to an [R,G,B,A] array of normalized values (numbers from 0.0 to 1.0).
 * @example
 * import { utils } from 'pixi.js';
 * new utils.Color('red').toArray(); // [1, 0, 0, 1]
 * new utils.Color(0xff0000).toArray(); // [1, 0, 0, 1]
 * new utils.Color('ff0000').toArray(); // [1, 0, 0, 1]
 * new utils.Color('#f00').toArray(); // [1, 0, 0, 1]
 * new utils.Color([255, 0, 0, 0.5]).toArray(); // [1, 0, 0, 0.5]
 * new utils.Color('rgb(255, 0, 0, 0.5)').toArray(); // [1, 0, 0, 0.5]
 * new utils.Color({h: 0, s: 100, l: 50, a: 0.5}).toArray(); // [1, 0, 0, 0.5]
 * new utils.Color({h: 0, s: 100, v: 100, a: 0.5}).toArray(); // [1, 0, 0, 0.5]
 * @memberof PIXI.utils
 */
export class Color
{
    /**
     * Default Color object for static uses
     * @example
     * import { utils } from 'pixi.js';
     * utils.Color.default.setValue(0xffffff).toString(); // '#ffffff'
     */
    static readonly default = new Color();

    /** Pattern for hex strings */
    static readonly HEX_PATTERN = /^#?([a-f0-9]{3}){1,2}([a-f0-9]{2})?$/i;

    /** Internal color source, from constructor or set value */
    private _value: ColorSource;

    /** Normalized rgba component, floats from 0-1 */
    private _components: Float32Array;

    /** Cache color as number */
    private _int: number;

    /**
     * @param {PIXI.ColorSource} value - Optional value to use, if not provided, white is used.
     */
    constructor(value: ColorSource = 0xffffff)
    {
        this._components = new Float32Array(4);
        this._components.fill(1);
        this.value = value;
    }

    /**
     * Set the value, suitable for chaining
     * @param value
     */
    setValue(value: ColorSource): this
    {
        this.value = value;

        return this;
    }

    /**
     * Set the current color source
     * @type {PIXI.ColorSource}
     */
    set value(value: ColorSource)
    {
        if (this._value !== value)
        {
            this.normalize();
            this._value = value;
        }
    }
    get value(): ColorSource
    {
        return this._value;
    }

    /**
     * Get RGBA color object.
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toRgb(); // returns { r: 1, g: 1, b: 1, a: 1 }
     */
    toRgba(): RgbaColor
    {
        const [r, g, b, a] = this._components;

        return { r, g, b, a };
    }

    /**
     * Get RGB color object.
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toRgb(); // returns { r: 1, g: 1, b: 1 }
     */
    toRgb(): RgbColor
    {
        const [r, g, b] = this._components;

        return { r, g, b };
    }

    /** Get the color as a CSS-style rgba string: `rgba(255,255,255,1.0)`. */
    toRgbaString(): string
    {
        const [r, g, b, a] = this._components;

        return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
    }

    /**
     * Converts color to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toRgbArray(); // returns [1, 1, 1]
     * @param {number[]|Float32Array} [out] - Output array
     */
    toRgbArray<T extends (number[] | Float32Array) = number[]>(out?: T): T
    {
        out = out ?? [] as T;
        const [r, g, b] = this._components;

        out[0] = r;
        out[1] = g;
        out[2] = b;

        return out;
    }

    /**
     * Converts a color to a hexadecimal number.
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toNumber(); // returns 16777215
     */
    toNumber(): number
    {
        return this._int;
    }

    /**
     * Converts a hexadecimal color number to a string.
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toString(); // returns "#ffffff"
     */
    toString(): string
    {
        const hexString = this._int.toString(16);

        return `#${'000000'.substring(0, 6 - hexString.length) + hexString}`;
    }

    /**
     * Convert to a hexidecimal string with alpha.
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toHexString(); // returns "#ffffffff"
     */
    toHexString(): string
    {
        const alphaValue = Math.round(this._components[3] * 255);
        const alphaString = alphaValue.toString(16);

        return this.toString() + '00'.substring(0, 2 - alphaString.length) + alphaString;
    }

    /**
     * Set alpha, suitable for chaining.
     * @param alpha
     */
    setAlpha(alpha: number): this
    {
        this._components[3] = alpha;

        return this;
    }

    /** Get the alpha amount */
    toAlpha(): number
    {
        return this._components[3];
    }

    /**
     * Rounds the specified color according to the step.
     * @param step - Number of steps which will be used as a cap when rounding colors
     */
    round(step: number): this
    {
        const [r, g, b] = this._components;

        this._components.set([
            Math.min(255, (r / step) * step),
            Math.min(255, (g / step) * step),
            Math.min(255, (b / step) * step),
        ]);

        return this;
    }

    /**
     * Converts color to an [R, G, B, A] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { utils } from 'pixi.js';
     * new utils.Color('white').toArray(); // returns [1, 1, 1, 1]
     * @param {number[]|Float32Array} [out] - Output array
     */
    toArray<T extends (number[] | Float32Array) = number[]>(out?: T): T
    {
        out = out ?? [] as T;
        const [r, g, b, a] = this._components;

        out[0] = r;
        out[1] = g;
        out[2] = b;
        out[3] = a;

        return out;
    }

    /** Normalize the input value into rgba */
    private normalize(): void
    {
        let value = this._value;
        let components: number[];

        if ((Array.isArray(value) || value instanceof Float32Array) && value.length >= 3)
        {
            // Handle floats or uints
            const normalizeValue = (v: number) => (v > 1 ? v / 255 : v);

            components = [
                normalizeValue(value[0]),
                normalizeValue(value[1]),
                normalizeValue(value[2]),
                value[3] ?? 1.0,
            ];
        }
        else if (typeof value === 'string' || typeof value === 'object')
        {
            if (typeof value === 'string')
            {
                if (value.startsWith('0x'))
                {
                    value = value.slice(2);
                }
                if (Color.HEX_PATTERN.test(value) && !value.startsWith('#'))
                {
                    value = `#${value}`;
                }
            }

            const color = colord(value as AnyColor);

            if (!color.isValid())
            {
                throw new Error(`Unable to convert color ${value}`);
            }

            const { r, g, b, a } = color.rgba;

            components = [r / 255, g / 255, b / 255, a];
        }
        else if (typeof value === 'number' && value >= 0 && value <= 0xffffff)
        {
            components = [
                ((value >> 16) & 0xFF) / 255,
                ((value >> 8) & 0xFF) / 255,
                (value & 0xFF) / 255,
                1.0
            ];
        }

        // Cache normalized values for rgba and hex integer
        if (components)
        {
            const [r, g, b] = components;

            this._components.set(components);
            this._int = (((r * 255) << 16) + ((g * 255) << 8) + (b * 255 | 0));
        }
        else
        {
            throw new Error(`Unable to convert color ${value}`);
        }
    }
}

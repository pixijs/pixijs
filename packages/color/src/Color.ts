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

/** Possible value types for Color class */
export type ColorSource = string | number | number[] | Float32Array | Uint8Array | Uint8ClampedArray
| HslColor | HslaColor | HsvColor | HsvaColor | RgbColor | RgbaColor | Color;

/**
 * Color utility class
 * @example
 * import { Color } from 'pixi.js';
 * new Color('red').toArray(); // [1, 0, 0, 1]
 * new Color(0xff0000).toArray(); // [1, 0, 0, 1]
 * new Color('ff0000').toArray(); // [1, 0, 0, 1]
 * new Color('#f00').toArray(); // [1, 0, 0, 1]
 * new Color([1, 0, 0, 0.5]).toArray(); // [1, 0, 0, 0.5]
 * new Color([1, 1, 1]).toArray(); // [1, 1, 1, 1]
 * new Color('rgb(255, 0, 0, 0.5)').toArray(); // [1, 0, 0, 0.5]
 * new Color({h: 0, s: 100, l: 50, a: 0.5}).toArray(); // [1, 0, 0, 0.5]
 * new Color({h: 0, s: 100, v: 100, a: 0.5}).toArray(); // [1, 0, 0, 0.5]
 * @memberof PIXI
 */
export class Color
{
    /**
     * Default Color object for static uses
     * @example
     * import { Color } from 'pixi.js';
     * Color.shared.setValue(0xffffff).toHex(); // '#ffffff'
     */
    static readonly shared = new Color();

    /** Pattern for hex strings */
    private static readonly HEX_PATTERN = /^(#|0x)?(([a-f0-9]{3}){1,2}([a-f0-9]{2})?)$/i;

    /** Internal color source, from constructor or set value */
    private _value: Exclude<ColorSource, Color>;

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

    /** Get red component (0 - 1) */
    get red(): number
    {
        return this._components[0];
    }

    /** Get green component (0 - 1) */
    get green(): number
    {
        return this._components[1];
    }

    /** Get blue component (0 - 1) */
    get blue(): number
    {
        return this._components[2];
    }

    /** Get alpha component (0 - 1) */
    get alpha(): number
    {
        return this._components[3];
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
        // Support copying from other Color objects
        if (value instanceof Color)
        {
            this._value = value._value;
            this._int = value._int;
            this._components.set(value._components);
        }
        else if (this._value !== value)
        {
            this.normalize(value);
            this._value = value;
        }
    }
    get value(): Exclude<ColorSource, Color>
    {
        return this._value;
    }

    /**
     * Convert to a RGBA color object.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1, a: 1 }
     */
    toRgba(): RgbaColor
    {
        const [r, g, b, a] = this._components;

        return { r, g, b, a };
    }

    /**
     * Convert to a RGB color object.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1 }
     */
    toRgb(): RgbColor
    {
        const [r, g, b] = this._components;

        return { r, g, b };
    }

    /** Convert to a CSS-style rgba string: `rgba(255,255,255,1.0)`. */
    toRgbaString(): string
    {
        const [r, g, b] = this.toUint8RgbArray();

        return `rgba(${r},${g},${b},${this.alpha})`;
    }

    /**
     * Convert to an [R, G, B] array of clamped uint8 values (0 to 255).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toUint8RgbArray(); // returns [255, 255, 255]
     * @param {number[]|Uint8Array|Uint8ClampedArray} [out] - Output array
     */
    toUint8RgbArray<T extends (number[] | Uint8Array | Uint8ClampedArray) = number[]>(out?: T): T
    {
        const [r, g, b] = this._components;

        out = out ?? [] as T;

        out[0] = Math.round(r * 255);
        out[1] = Math.round(g * 255);
        out[2] = Math.round(b * 255);

        return out;
    }

    /**
     * Convert to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgbArray(); // returns [1, 1, 1]
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
     * Convert to a hexadecimal number.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toNumber(); // returns 16777215
     */
    toNumber(): number
    {
        return this._int;
    }

    /**
     * Convert to a hexadecimal number in little endian format (e.g., BBGGRR).
     * @example
     * import { Color } from 'pixi.js';
     * new Color(0xffcc99).toLittleEndianNumber(); // returns 0x99ccff
     * @returns {number} - The color as a number in little endian format.
     */
    toLittleEndianNumber(): number
    {
        const value = this._int;

        return (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
    }

    /**
     * Multiply the colors
     * @param {PIXI.Color | number[]} value - The color to multiply by, either
     *   and existing Color object or an [R, G, B] or [R, G, B, A] array of floats.
     */
    multiply(value: Color | number[]): this
    {
        const [r, g, b, a = 1] = value instanceof Color ? value._components : value;

        this._components[0] *= r;
        this._components[1] *= g;
        this._components[2] *= b;
        this._components[3] *= a;

        return this;
    }

    /**
     * Convert to a hexidecimal string.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toHex(); // returns "#ffffff"
     */
    toHex(): string
    {
        const hexString = this._int.toString(16);

        return `#${'000000'.substring(0, 6 - hexString.length) + hexString}`;
    }

    /**
     * Convert to a hexidecimal string with alpha.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toHexa(); // returns "#ffffffff"
     */
    toHexa(): string
    {
        const alphaValue = Math.round(this._components[3] * 255);
        const alphaString = alphaValue.toString(16);

        return this.toHex() + '00'.substring(0, 2 - alphaString.length) + alphaString;
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
     * Convert to an [R, G, B, A] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toArray(); // returns [1, 1, 1, 1]
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

    /**
     * Normalize the input value into rgba
     * @param value - Input value
     */
    private normalize(value: Exclude<ColorSource, Color>): void
    {
        let components: number[];

        if ((Array.isArray(value) || value instanceof Float32Array)
            // Can be rgb or rgba
            && value.length >= 3 && value.length <= 4
            // make sure all values are 0 - 1
            && value.every((v) => v <= 1 && v >= 0))
        {
            const [r, g, b, a = 1.0] = value;

            components = [r, g, b, a];
        }
        else if ((value instanceof Uint8Array || value instanceof Uint8ClampedArray)
            // Can be rgb or rgba
            && value.length >= 3 && value.length <= 4)
        {
            const [r, g, b, a = 255] = value;

            components = [r / 255, g / 255, b / 255, a / 255];
        }
        else if (typeof value === 'string' || typeof value === 'object')
        {
            if (typeof value === 'string')
            {
                const match = Color.HEX_PATTERN.exec(value);

                if (match)
                {
                    // Normalize hex string, remove 0x or # prefix
                    value = `#${match[2]}`;
                }
            }

            const color = colord(value as AnyColor);

            if (color.isValid())
            {
                const { r, g, b, a } = color.rgba;

                components = [r / 255, g / 255, b / 255, a];
            }
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

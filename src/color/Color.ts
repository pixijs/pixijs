import { colord, extend } from '@pixi/colord';
import namesPlugin from '@pixi/colord/plugins/names';

import type { AnyColor, HslaColor, HslColor, HsvaColor, HsvColor, RgbaColor, RgbColor } from '@pixi/colord';

extend([namesPlugin]);

/**
 * Pixi supports multiple color formats, including CSS color strings, hex, numbers, and arrays.
 *
 * When providing values for any of the color properties, you can use any of the {@link color.ColorSource} formats.
 * ```typescript
 * import { Color } from 'pixi.js';
 *
 * // All of these are valid:
 * sprite.tint = 'red';
 * sprite.tint = 0xff0000;
 * sprite.tint = '#ff0000';
 * sprite.tint = new Color('red');
 *
 * // Same for graphics fill/stroke colors and other  color values:
 * graphics.fill({ color: 'red' });
 * graphics.fill({ color: 0xff0000 });
 * graphics.stroke({ color: '#ff0000' });
 * graphics.stroke({ color: new Color('red')};
 * ```
 * @namespace color
 */

/**
 * RGBA color array.
 *
 * `[number, number, number, number]`
 * @memberof color
 */
export type RgbaArray = [number, number, number, number];

/**
 * Valid formats to use when defining any color properties, also valid for the {@link color.Color} constructor.
 *
 * These types are extended from [colord](https://www.npmjs.com/package/colord) with some PixiJS-specific extensions.
 *
 * Possible value types are:
 * - [Color names](https://www.w3.org/TR/css-color-4/#named-colors):
 *   `'red'`, `'green'`, `'blue'`, `'white'`, etc.
 * - RGB hex integers (`0xRRGGBB`):
 *   `0xff0000`, `0x00ff00`, `0x0000ff`, etc.
 * - [RGB(A) hex strings](https://www.w3.org/TR/css-color-4/#hex-notation):
 *   - 6 digits (`RRGGBB`): `'ff0000'`, `'#00ff00'`, `'0x0000ff'`, etc.
 *   - 3 digits (`RGB`): `'f00'`, `'#0f0'`, `'0x00f'`, etc.
 *   - 8 digits (`RRGGBBAA`): `'ff000080'`, `'#00ff0080'`, `'0x0000ff80'`, etc.
 *   - 4 digits (`RGBA`): `'f008'`, `'#0f08'`, `'0x00f8'`, etc.
 * - RGB(A) objects:
 *   `{ r: 255, g: 0, b: 0 }`, `{ r: 255, g: 0, b: 0, a: 0.5 }`, etc.
 * - [RGB(A) strings](https://www.w3.org/TR/css-color-4/#rgb-functions):
 *   `'rgb(255, 0, 0)'`, `'rgb(100% 0% 0%)'`, `'rgba(255, 0, 0, 0.5)'`, `'rgba(100% 0% 0% / 50%)'`, etc.
 * - RGB(A) arrays:
 *   `[1, 0, 0]`, `[1, 0, 0, 0.5]`, etc.
 * - RGB(A) Float32Array:
 *   `new Float32Array([1, 0, 0])`, `new Float32Array([1, 0, 0, 0.5])`, etc.
 * - RGB(A) Uint8Array:
 *   `new Uint8Array([255, 0, 0])`, `new Uint8Array([255, 0, 0, 128])`, etc.
 * - RGB(A) Uint8ClampedArray:
 *   `new Uint8ClampedArray([255, 0, 0])`, `new Uint8ClampedArray([255, 0, 0, 128])`, etc.
 * - HSL(A) objects:
 *   `{ h: 0, s: 100, l: 50 }`, `{ h: 0, s: 100, l: 50, a: 0.5 }`, etc.
 * - [HSL(A) strings](https://www.w3.org/TR/css-color-4/#the-hsl-notation):
 *   `'hsl(0, 100%, 50%)'`, `'hsl(0deg 100% 50%)'`, `'hsla(0, 100%, 50%, 0.5)'`, `'hsla(0deg 100% 50% / 50%)'`, etc.
 * - HSV(A) objects:
 *   `{ h: 0, s: 100, v: 100 }`, `{ h: 0, s: 100, v: 100, a: 0.5 }`, etc.
 * - {@link color.Color} objects.
 * @since 7.2.0
 * @memberof color
 */
export type ColorSource =
    | string
    | number
    | number[]
    | Float32Array
    | Uint8Array
    | Uint8ClampedArray
    | HslColor
    | HslaColor
    | HsvColor
    | HsvaColor
    | RgbColor
    | RgbaColor
    | Color
    // eslint-disable-next-line @typescript-eslint/ban-types
    | Number;

type ColorSourceTypedArray = Float32Array | Uint8Array | Uint8ClampedArray;

/**
 * Color utility class. Can accept any {@link color.ColorSource} format in its constructor.
 * ```js
 * import { Color } from 'pixi.js';
 *
 * new Color('red').toArray(); // [1, 0, 0, 1]
 * new Color(0xff0000).toArray(); // [1, 0, 0, 1]
 * new Color('ff0000').toArray(); // [1, 0, 0, 1]
 * new Color('#f00').toArray(); // [1, 0, 0, 1]
 * new Color('0xff0000ff').toArray(); // [1, 0, 0, 1]
 * new Color('#f00f').toArray(); // [1, 0, 0, 1]
 * new Color({ r: 255, g: 0, b: 0, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
 * new Color('rgb(255, 0, 0, 0.5)').toArray(); // [1, 0, 0, 0.5]
 * new Color([1, 1, 1]).toArray(); // [1, 1, 1, 1]
 * new Color([1, 0, 0, 0.5]).toArray(); // [1, 0, 0, 0.5]
 * new Color(new Float32Array([1, 0, 0, 0.5])).toArray(); // [1, 0, 0, 0.5]
 * new Color(new Uint8Array([255, 0, 0, 255])).toArray(); // [1, 0, 0, 1]
 * new Color(new Uint8ClampedArray([255, 0, 0, 255])).toArray(); // [1, 0, 0, 1]
 * new Color({ h: 0, s: 100, l: 50, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
 * new Color('hsl(0, 100%, 50%, 50%)').toArray(); // [1, 0, 0, 0.5]
 * new Color({ h: 0, s: 100, v: 100, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
 * ```
 * @since 7.2.0
 * @memberof color
 */
export class Color
{
    /**
     * Default Color object for static uses
     * @example
     * import { Color } from 'pixi.js';
     * Color.shared.setValue(0xffffff).toHex(); // '#ffffff'
     */
    public static readonly shared = new Color();

    /**
     * Temporary Color object for static uses internally.
     * As to not conflict with Color.shared.
     * @ignore
     */
    private static readonly _temp = new Color();

    /** Pattern for hex strings */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly HEX_PATTERN = /^(#|0x)?(([a-f0-9]{3}){1,2}([a-f0-9]{2})?)$/i;

    /** Internal color source, from constructor or set value */
    private _value: Exclude<ColorSource, Color> | null;

    /** Normalized rgba component, floats from 0-1 */
    private _components: Float32Array;

    /** Cache color as number */
    private _int: number;

    /** An array of the current Color. Only populated when `toArray` functions are called */
    private _arrayRgba: number[] | null;
    private _arrayRgb: number[] | null;

    /**
     * @param {ColorSource} value - Optional value to use, if not provided, white is used.
     */
    constructor(value: ColorSource = 0xffffff)
    {
        this._value = null;
        this._components = new Float32Array(4);
        this._components.fill(1);
        this._int = 0xffffff;
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
     * @see Color.value
     */
    public setValue(value: ColorSource): this
    {
        this.value = value;

        return this;
    }

    /**
     * The current color source.
     *
     * When setting:
     * - Setting to an instance of `Color` will copy its color source and components.
     * - Otherwise, `Color` will try to normalize the color source and set the components.
     *   If the color source is invalid, an `Error` will be thrown and the `Color` will left unchanged.
     *
     * Note: The `null` in the setter's parameter type is added to match the TypeScript rule: return type of getter
     * must be assignable to its setter's parameter type. Setting `value` to `null` will throw an `Error`.
     *
     * When getting:
     * - A return value of `null` means the previous value was overridden (e.g., {@link Color.multiply multiply},
     *   {@link Color.premultiply premultiply} or {@link Color.round round}).
     * - Otherwise, the color source used when setting is returned.
     */
    set value(value: ColorSource | null)
    {
        // Support copying from other Color objects
        if (value instanceof Color)
        {
            this._value = this._cloneSource(value._value);
            this._int = value._int;
            this._components.set(value._components);
        }
        else if (value === null)
        {
            throw new Error('Cannot set Color#value to null');
        }
        else if (this._value === null || !this._isSourceEqual(this._value, value))
        {
            this._normalize(value);
            this._value = this._cloneSource(value);
        }
    }
    get value(): Exclude<ColorSource, Color> | null
    {
        return this._value;
    }

    /**
     * Copy a color source internally.
     * @param value - Color source
     */
    private _cloneSource(value: Exclude<ColorSource, Color> | null): Exclude<ColorSource, Color> | null
    {
        if (typeof value === 'string' || typeof value === 'number' || value instanceof Number || value === null)
        {
            return value;
        }
        else if (Array.isArray(value) || ArrayBuffer.isView(value))
        {
            return value.slice(0);
        }
        else if (typeof value === 'object' && value !== null)
        {
            return { ...value };
        }

        return value;
    }

    /**
     * Equality check for color sources.
     * @param value1 - First color source
     * @param value2 - Second color source
     * @returns `true` if the color sources are equal, `false` otherwise.
     */
    private _isSourceEqual(value1: Exclude<ColorSource, Color>, value2: Exclude<ColorSource, Color>): boolean
    {
        const type1 = typeof value1;
        const type2 = typeof value2;

        // Mismatched types
        if (type1 !== type2)
        {
            return false;
        }
        // Handle numbers/strings and things that extend Number
        // important to do the instanceof Number first, as this is "object" type
        else if (type1 === 'number' || type1 === 'string' || value1 instanceof Number)
        {
            return value1 === value2;
        }
        // Handle Arrays and TypedArrays
        else if (
            (Array.isArray(value1) && Array.isArray(value2))
            || (ArrayBuffer.isView(value1) && ArrayBuffer.isView(value2))
        )
        {
            if (value1.length !== value2.length)
            {
                return false;
            }

            return value1.every((v, i) => v === value2[i]);
        }
        // Handle Objects
        else if (value1 !== null && value2 !== null)
        {
            const keys1 = Object.keys(value1) as (keyof typeof value1)[];
            const keys2 = Object.keys(value2) as (keyof typeof value2)[];

            if (keys1.length !== keys2.length)
            {
                return false;
            }

            return keys1.every((key) => value1[key] === value2[key]);
        }

        return value1 === value2;
    }

    /**
     * Convert to a RGBA color object.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1, a: 1 }
     */
    public toRgba(): RgbaColor
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
    public toRgb(): RgbColor
    {
        const [r, g, b] = this._components;

        return { r, g, b };
    }

    /** Convert to a CSS-style rgba string: `rgba(255,255,255,1.0)`. */
    public toRgbaString(): string
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
    public toUint8RgbArray(): number[];
    public toUint8RgbArray<T extends number[] | Uint8Array | Uint8ClampedArray>(out: T): T;
    public toUint8RgbArray<T extends number[] | Uint8Array | Uint8ClampedArray>(out?: T): T
    {
        const [r, g, b] = this._components;

        if (!this._arrayRgb)
        {
            this._arrayRgb = [];
        }

        out = out || this._arrayRgb as T;

        out[0] = Math.round(r * 255);
        out[1] = Math.round(g * 255);
        out[2] = Math.round(b * 255);

        return out;
    }

    /**
     * Convert to an [R, G, B, A] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toArray(); // returns [1, 1, 1, 1]
     * @param {number[]|Float32Array} [out] - Output array
     */
    public toArray(): number[];
    public toArray<T extends number[] | Float32Array>(out: T): T;
    public toArray<T extends number[] | Float32Array>(out?: T): T
    {
        if (!this._arrayRgba)
        {
            this._arrayRgba = [];
        }

        out = out || this._arrayRgba as T;
        const [r, g, b, a] = this._components;

        out[0] = r;
        out[1] = g;
        out[2] = b;
        out[3] = a;

        return out;
    }

    /**
     * Convert to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgbArray(); // returns [1, 1, 1]
     * @param {number[]|Float32Array} [out] - Output array
     */
    public toRgbArray(): number[];
    public toRgbArray<T extends number[] | Float32Array>(out: T): T;
    public toRgbArray<T extends number[] | Float32Array>(out?: T): T
    {
        if (!this._arrayRgb)
        {
            this._arrayRgb = [];
        }

        out = out || this._arrayRgb as T;
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
    public toNumber(): number
    {
        return this._int;
    }

    /**
     * Convert to a BGR number
     * @example
     * import { Color } from 'pixi.js';
     * new Color(0xffcc99).toBgrNumber(); // returns 0x99ccff
     */
    public toBgrNumber(): number
    {
        const [r, g, b] = this.toUint8RgbArray();

        return (b << 16) + (g << 8) + r;
    }

    /**
     * Convert to a hexadecimal number in little endian format (e.g., BBGGRR).
     * @example
     * import { Color } from 'pixi.js';
     * new Color(0xffcc99).toLittleEndianNumber(); // returns 0x99ccff
     * @returns {number} - The color as a number in little endian format.
     */
    public toLittleEndianNumber(): number
    {
        const value = this._int;

        return (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
    }

    /**
     * Multiply with another color. This action is destructive, and will
     * override the previous `value` property to be `null`.
     * @param {ColorSource} value - The color to multiply by.
     */
    public multiply(value: ColorSource): this
    {
        const [r, g, b, a] = Color._temp.setValue(value)._components;

        this._components[0] *= r;
        this._components[1] *= g;
        this._components[2] *= b;
        this._components[3] *= a;

        this._refreshInt();
        this._value = null;

        return this;
    }

    /**
     * Converts color to a premultiplied alpha format. This action is destructive, and will
     * override the previous `value` property to be `null`.
     * @param alpha - The alpha to multiply by.
     * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels.
     * @returns {Color} - Itself.
     */
    public premultiply(alpha: number, applyToRGB = true): this
    {
        if (applyToRGB)
        {
            this._components[0] *= alpha;
            this._components[1] *= alpha;
            this._components[2] *= alpha;
        }
        this._components[3] = alpha;

        this._refreshInt();
        this._value = null;

        return this;
    }

    /**
     * Premultiplies alpha with current color.
     * @param {number} alpha - The alpha to multiply by.
     * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels.
     * @returns {number} tint multiplied by alpha
     */
    public toPremultiplied(alpha: number, applyToRGB = true): number
    {
        if (alpha === 1.0)
        {
            return (0xff << 24) + this._int;
        }
        if (alpha === 0.0)
        {
            return applyToRGB ? 0 : this._int;
        }
        let r = (this._int >> 16) & 0xff;
        let g = (this._int >> 8) & 0xff;
        let b = this._int & 0xff;

        if (applyToRGB)
        {
            r = ((r * alpha) + 0.5) | 0;
            g = ((g * alpha) + 0.5) | 0;
            b = ((b * alpha) + 0.5) | 0;
        }

        return ((alpha * 255) << 24) + (r << 16) + (g << 8) + b;
    }

    /**
     * Convert to a hexidecimal string.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toHex(); // returns "#ffffff"
     */
    public toHex(): string
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
    public toHexa(): string
    {
        const alphaValue = Math.round(this._components[3] * 255);
        const alphaString = alphaValue.toString(16);

        return this.toHex() + '00'.substring(0, 2 - alphaString.length) + alphaString;
    }

    /**
     * Set alpha, suitable for chaining.
     * @param alpha
     */
    public setAlpha(alpha: number): this
    {
        this._components[3] = this._clamp(alpha);

        return this;
    }

    /**
     * Normalize the input value into rgba
     * @param value - Input value
     */
    private _normalize(value: Exclude<ColorSource, Color>): void
    {
        let r: number | undefined;
        let g: number | undefined;
        let b: number | undefined;
        let a: number | undefined;

        // Number is a primative so typeof works fine, but in the case
        // that someone creates a class that extends Number, we also
        // need to check for instanceof Number
        if (
            (typeof value === 'number' || value instanceof Number)
            && (value as number) >= 0
            && (value as number) <= 0xffffff
        )
        {
            const int = value as number; // cast required because instanceof Number is ambiguous for TS

            r = ((int >> 16) & 0xff) / 255;
            g = ((int >> 8) & 0xff) / 255;
            b = (int & 0xff) / 255;
            a = 1.0;
        }
        else if (
            (Array.isArray(value) || value instanceof Float32Array)
            // Can be rgb or rgba
            && value.length >= 3
            && value.length <= 4
        )
        {
            // make sure all values are 0 - 1
            value = this._clamp(value);
            [r, g, b, a = 1.0] = value;
        }
        else if (
            (value instanceof Uint8Array || value instanceof Uint8ClampedArray)
            // Can be rgb or rgba
            && value.length >= 3
            && value.length <= 4
        )
        {
            // make sure all values are 0 - 255
            value = this._clamp(value, 0, 255);
            [r, g, b, a = 255] = value;
            r /= 255;
            g /= 255;
            b /= 255;
            a /= 255;
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
                ({ r, g, b, a } = color.rgba);
                r /= 255;
                g /= 255;
                b /= 255;
            }
        }

        // Cache normalized values for rgba and hex integer
        if (r !== undefined)
        {
            this._components[0] = r as number;
            this._components[1] = g as number;
            this._components[2] = b as number;
            this._components[3] = a as number;
            this._refreshInt();
        }
        else
        {
            throw new Error(`Unable to convert color ${value}`);
        }
    }

    /** Refresh the internal color rgb number */
    private _refreshInt(): void
    {
        // Clamp values to 0 - 1
        this._clamp(this._components);

        const [r, g, b] = this._components;

        this._int = ((r * 255) << 16) + ((g * 255) << 8) + ((b * 255) | 0);
    }

    /**
     * Clamps values to a range. Will override original values
     * @param value - Value(s) to clamp
     * @param min - Minimum value
     * @param max - Maximum value
     */
    private _clamp<T extends number | number[] | ColorSourceTypedArray>(value: T, min = 0, max = 1): T
    {
        if (typeof value === 'number')
        {
            return Math.min(Math.max(value, min), max) as T;
        }

        value.forEach((v, i) =>
        {
            value[i] = Math.min(Math.max(v, min), max);
        });

        return value;
    }

    /**
     * Check if the value is a color-like object
     * @param value - Value to check
     * @returns True if the value is a color-like object
     * @static
     * @example
     * import { Color } from 'pixi.js';
     * Color.isColorLike('white'); // returns true
     * Color.isColorLike(0xffffff); // returns true
     * Color.isColorLike([1, 1, 1]); // returns true
     */
    public static isColorLike(value: unknown): value is ColorSource
    {
        return (
            typeof value === 'number'
            || typeof value === 'string'
            || value instanceof Number
            || value instanceof Color
            || Array.isArray(value)
            || value instanceof Uint8Array
            || value instanceof Uint8ClampedArray
            || value instanceof Float32Array
            || ((value as RgbColor).r !== undefined
                && (value as RgbColor).g !== undefined
                && (value as RgbColor).b !== undefined)
            || ((value as RgbaColor).r !== undefined
                && (value as RgbaColor).g !== undefined
                && (value as RgbaColor).b !== undefined
                && (value as RgbaColor).a !== undefined)
            || ((value as HslColor).h !== undefined
                && (value as HslColor).s !== undefined
                && (value as HslColor).l !== undefined)
            || ((value as HslaColor).h !== undefined
                && (value as HslaColor).s !== undefined
                && (value as HslaColor).l !== undefined
                && (value as HslaColor).a !== undefined)
            || ((value as HsvColor).h !== undefined
                && (value as HsvColor).s !== undefined
                && (value as HsvColor).v !== undefined)
            || ((value as HsvaColor).h !== undefined
                && (value as HsvaColor).s !== undefined
                && (value as HsvaColor).v !== undefined
                && (value as HsvaColor).a !== undefined)
        );
    }
}

import { colord, extend } from '@pixi/colord';
import namesPlugin from '@pixi/colord/plugins/names';

import type { AnyColor, HslaColor, HslColor, HsvaColor, HsvColor, RgbaColor, RgbColor } from '@pixi/colord';

extend([namesPlugin]);

/**
 * Array of RGBA color components, where each component is a number between 0 and 1.
 * The array must contain exactly 4 numbers in the order: red, green, blue, alpha.
 * @example
 * ```ts
 * // Full white (opaque)
 * const white: RgbaArray = [1, 1, 1, 1];
 *
 * // Semi-transparent red
 * const transparentRed: RgbaArray = [1, 0, 0, 0.5];
 * ```
 * @remarks
 * - All components must be between 0 and 1
 * - Array must contain exactly 4 values
 * - Order is [red, green, blue, alpha]
 * @see {@link Color} For the main color utility class
 * @category color
 * @standard
 */
export type RgbaArray = [number, number, number, number];

/**
 * Valid color formats supported by PixiJS. These types extend from [colord](https://www.npmjs.com/package/colord)
 * with additional PixiJS-specific formats.
 *
 * Common Formats:
 * ```ts
 * // CSS Color Names
 * new Color('red');
 * new Color('blue');
 * new Color('green');
 *
 * // Hex Values
 * new Color(0xff0000);     // RGB integer
 * new Color('#ff0000');    // 6-digit hex
 * new Color('#f00');       // 3-digit hex
 * new Color('#ff0000ff');  // 8-digit hex (with alpha)
 * new Color('#f00f');      // 4-digit hex (with alpha)
 *
 * // RGB/RGBA Objects
 * new Color({ r: 255, g: 0, b: 0 });
 * new Color({ r: 255, g: 0, b: 0, a: 0.5 });
 *
 * // RGB/RGBA Strings
 * new Color('rgb(255, 0, 0)');
 * new Color('rgba(255, 0, 0, 0.5)');
 * new Color('rgb(100% 0% 0%)');
 * new Color('rgba(100% 0% 0% / 50%)');
 *
 * // Arrays (normalized 0-1)
 * new Color([1, 0, 0]);           // RGB
 * new Color([1, 0, 0, 0.5]);      // RGBA
 * new Color(new Float32Array([1, 0, 0, 0.5]));
 *
 * // Arrays (0-255)
 * new Color(new Uint8Array([255, 0, 0]));
 * new Color(new Uint8ClampedArray([255, 0, 0, 128]));
 *
 * // HSL/HSLA
 * new Color({ h: 0, s: 100, l: 50 });
 * new Color({ h: 0, s: 100, l: 50, a: 0.5 });
 * new Color('hsl(0, 100%, 50%)');
 * new Color('hsla(0deg 100% 50% / 50%)');
 *
 * // HSV/HSVA
 * new Color({ h: 0, s: 100, v: 100 });
 * new Color({ h: 0, s: 100, v: 100, a: 0.5 });
 * ```
 * @remarks
 * - All color values are normalized internally to 0-1 range
 * - Alpha is always between 0-1
 * - Invalid colors will throw an error
 * - Original format is preserved when possible
 * @see {@link Color} For the main color utility class
 * @see {@link https://www.w3.org/TR/css-color-4} CSS Color Level 4 Specification
 * @since 7.2.0
 * @category color
 * @standard
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
    | number;

type ColorSourceTypedArray = Float32Array | Uint8Array | Uint8ClampedArray;

/**
 * Color utility class for managing colors in various formats. Provides a unified way to work
 * with colors across your PixiJS application.
 *
 * Features:
 * - Accepts multiple color formats (hex, RGB, HSL, etc.)
 * - Automatic format conversion
 * - Color manipulation methods
 * - Component access (r,g,b,a)
 * - Chainable operations
 * @example
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
 *
 * // Convert between formats
 * const color = new Color('red');
 * color.toHex();        // "#ff0000"
 * color.toRgbString();  // "rgb(255,0,0,1)"
 * color.toNumber();     // 0xff0000
 *
 * // Access components
 * color.red;    // 1
 * color.green;  // 0
 * color.blue;   // 0
 * color.alpha;  // 1
 *
 * // Chain operations
 * color
 *   .setAlpha(0.5)
 *   .multiply([0.5, 0.5, 0.5])
 *   .premultiply(0.8);
 * ```
 * @remarks
 * The Color class automatically normalizes all color values internally:
 * - RGB components are stored as floats between 0-1
 * - Alpha is always between 0-1
 * - Color operations clamp values to valid ranges
 * - Original input format is preserved when possible
 * @since 7.2.0
 * @category color
 * @standard
 */
export class Color
{
    /**
     * Static shared Color instance used for utility operations. This is a singleton color object
     * that can be reused to avoid creating unnecessary Color instances.
     * > [!IMPORTANT] You should be careful when using this shared instance, as it is mutable and can be
     * > changed by any code that uses it.
     * >
     * > It is best used for one-off color operations or temporary transformations.
     * > For persistent colors, create your own Color instance instead.
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Use shared instance for one-off color operations
     * Color.shared.setValue(0xff0000);
     * const redHex = Color.shared.toHex();     // "#ff0000"
     * const redRgb = Color.shared.toRgbArray(); // [1, 0, 0]
     *
     * // Temporary color transformations
     * const colorNumber = Color.shared
     *     .setValue('#ff0000')     // Set to red
     *     .setAlpha(0.5)          // Make semi-transparent
     *     .premultiply(0.8)       // Apply premultiplication
     *     .toNumber();            // Convert to number
     *
     * // Chain multiple operations
     * const result = Color.shared
     *     .setValue(someColor)
     *     .multiply(tintColor)
     *     .toPremultiplied(alpha);
     * ```
     * @remarks
     * - This is a shared instance - be careful about multiple code paths using it simultaneously
     * - Use for temporary color operations to avoid allocating new Color instances
     * - The value is preserved between operations, so reset if needed
     * - For persistent colors, create your own Color instance instead
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

    /**
     * Get the red component of the color, normalized between 0 and 1.
     * @example
     * ```ts
     * const color = new Color('red');
     * console.log(color.red); // 1
     *
     * const green = new Color('#00ff00');
     * console.log(green.red); // 0
     * ```
     */
    get red(): number
    {
        return this._components[0];
    }

    /**
     * Get the green component of the color, normalized between 0 and 1.
     * @example
     * ```ts
     * const color = new Color('lime');
     * console.log(color.green); // 1
     *
     * const red = new Color('#ff0000');
     * console.log(red.green); // 0
     * ```
     */
    get green(): number
    {
        return this._components[1];
    }

    /**
     * Get the blue component of the color, normalized between 0 and 1.
     * @example
     * ```ts
     * const color = new Color('blue');
     * console.log(color.blue); // 1
     *
     * const yellow = new Color('#ffff00');
     * console.log(yellow.blue); // 0
     * ```
     */
    get blue(): number
    {
        return this._components[2];
    }

    /**
     * Get the alpha component of the color, normalized between 0 and 1.
     * @example
     * ```ts
     * const color = new Color('red');
     * console.log(color.alpha); // 1 (fully opaque)
     *
     * const transparent = new Color('rgba(255, 0, 0, 0.5)');
     * console.log(transparent.alpha); // 0.5 (semi-transparent)
     * ```
     */
    get alpha(): number
    {
        return this._components[3];
    }

    /**
     * Sets the color value and returns the instance for chaining.
     *
     * This is a chainable version of setting the `value` property.
     * @param value - The color to set. Accepts various formats:
     * - Hex strings/numbers (e.g., '#ff0000', 0xff0000)
     * - RGB/RGBA values (arrays, objects)
     * - CSS color names
     * - HSL/HSLA values
     * - HSV/HSVA values
     * @returns The Color instance for chaining
     * @example
     * ```ts
     * // Basic usage
     * const color = new Color();
     * color.setValue('#ff0000')
     *     .setAlpha(0.5)
     *     .premultiply(0.8);
     *
     * // Different formats
     * color.setValue(0xff0000);          // Hex number
     * color.setValue('#ff0000');         // Hex string
     * color.setValue([1, 0, 0]);         // RGB array
     * color.setValue([1, 0, 0, 0.5]);    // RGBA array
     * color.setValue({ r: 1, g: 0, b: 0 }); // RGB object
     *
     * // Copy from another color
     * const red = new Color('red');
     * color.setValue(red);
     * ```
     * @throws {Error} If the color value is invalid or null
     * @see {@link Color.value} For the underlying value property
     */
    public setValue(value: ColorSource): this
    {
        this.value = value;

        return this;
    }

    /**
     * The current color source. This property allows getting and setting the color value
     * while preserving the original format where possible.
     * @remarks
     * When setting:
     * - Setting to a `Color` instance copies its source and components
     * - Setting to other valid sources normalizes and stores the value
     * - Setting to `null` throws an Error
     * - The color remains unchanged if normalization fails
     *
     * When getting:
     * - Returns `null` if color was modified by {@link Color.multiply} or {@link Color.premultiply}
     * - Otherwise returns the original color source
     * @example
     * ```ts
     * // Setting different color formats
     * const color = new Color();
     *
     * color.value = 0xff0000;         // Hex number
     * color.value = '#ff0000';        // Hex string
     * color.value = [1, 0, 0];        // RGB array
     * color.value = [1, 0, 0, 0.5];   // RGBA array
     * color.value = { r: 1, g: 0, b: 0 }; // RGB object
     *
     * // Copying from another color
     * const red = new Color('red');
     * color.value = red;  // Copies red's components
     *
     * // Getting the value
     * console.log(color.value);  // Returns original format
     *
     * // After modifications
     * color.multiply([0.5, 0.5, 0.5]);
     * console.log(color.value);  // Returns null
     * ```
     * @throws {Error} When attempting to set `null`
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
            this._value = this._cloneSource(value);
            this._normalize(this._value);
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
     * Convert to a RGBA color object with normalized components (0-1).
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Convert colors to RGBA objects
     * new Color('white').toRgba();     // returns { r: 1, g: 1, b: 1, a: 1 }
     * new Color('#ff0000').toRgba();   // returns { r: 1, g: 0, b: 0, a: 1 }
     *
     * // With transparency
     * new Color('rgba(255,0,0,0.5)').toRgba(); // returns { r: 1, g: 0, b: 0, a: 0.5 }
     * ```
     * @returns An RGBA object with normalized components
     */
    public toRgba(): RgbaColor
    {
        const [r, g, b, a] = this._components;

        return { r, g, b, a };
    }

    /**
     * Convert to a RGB color object with normalized components (0-1).
     *
     * Alpha component is omitted in the output.
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Convert colors to RGB objects
     * new Color('white').toRgb();     // returns { r: 1, g: 1, b: 1 }
     * new Color('#ff0000').toRgb();   // returns { r: 1, g: 0, b: 0 }
     *
     * // Alpha is ignored
     * new Color('rgba(255,0,0,0.5)').toRgb(); // returns { r: 1, g: 0, b: 0 }
     * ```
     * @returns An RGB object with normalized components
     */
    public toRgb(): RgbColor
    {
        const [r, g, b] = this._components;

        return { r, g, b };
    }

    /**
     * Convert to a CSS-style rgba string representation.
     *
     * RGB components are scaled to 0-255 range, alpha remains 0-1.
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Convert colors to RGBA strings
     * new Color('white').toRgbaString();     // returns "rgba(255,255,255,1)"
     * new Color('#ff0000').toRgbaString();   // returns "rgba(255,0,0,1)"
     *
     * // With transparency
     * new Color([1, 0, 0, 0.5]).toRgbaString(); // returns "rgba(255,0,0,0.5)"
     * ```
     * @returns A CSS-compatible rgba string
     */
    public toRgbaString(): string
    {
        const [r, g, b] = this.toUint8RgbArray();

        return `rgba(${r},${g},${b},${this.alpha})`;
    }

    /**
     * Convert to an [R, G, B] array of clamped uint8 values (0 to 255).
     * @param {number[]|Uint8Array|Uint8ClampedArray} [out] - Optional output array. If not provided,
     * a cached array will be used and returned.
     * @returns Array containing RGB components as integers between 0-255
     * @example
     * ```ts
     * // Basic usage
     * new Color('white').toUint8RgbArray(); // returns [255, 255, 255]
     * new Color('#ff0000').toUint8RgbArray(); // returns [255, 0, 0]
     *
     * // Using custom output array
     * const rgb = new Uint8Array(3);
     * new Color('blue').toUint8RgbArray(rgb); // rgb is now [0, 0, 255]
     *
     * // Using different array types
     * new Color('red').toUint8RgbArray(new Uint8ClampedArray(3)); // [255, 0, 0]
     * new Color('red').toUint8RgbArray([]); // [255, 0, 0]
     * ```
     * @remarks
     * - Output values are always clamped between 0-255
     * - Alpha component is not included in output
     * - Reuses internal cache array if no output array provided
     */
    public toUint8RgbArray<T extends number[] | Uint8Array | Uint8ClampedArray = number[]>(out?: T): T
    {
        const [r, g, b] = this._components;

        if (!this._arrayRgb)
        {
            this._arrayRgb = [];
        }

        out ||= this._arrayRgb as T;

        out[0] = Math.round(r * 255);
        out[1] = Math.round(g * 255);
        out[2] = Math.round(b * 255);

        return out;
    }

    /**
     * Convert to an [R, G, B, A] array of normalized floats (numbers from 0.0 to 1.0).
     * @param {number[]|Float32Array} [out] - Optional output array. If not provided,
     * a cached array will be used and returned.
     * @returns Array containing RGBA components as floats between 0-1
     * @example
     * ```ts
     * // Basic usage
     * new Color('white').toArray();  // returns [1, 1, 1, 1]
     * new Color('red').toArray();    // returns [1, 0, 0, 1]
     *
     * // With alpha
     * new Color('rgba(255,0,0,0.5)').toArray(); // returns [1, 0, 0, 0.5]
     *
     * // Using custom output array
     * const rgba = new Float32Array(4);
     * new Color('blue').toArray(rgba); // rgba is now [0, 0, 1, 1]
     * ```
     * @remarks
     * - Output values are normalized between 0-1
     * - Includes alpha component as the fourth value
     * - Reuses internal cache array if no output array provided
     */
    public toArray<T extends number[] | Float32Array = number[]>(out?: T): T
    {
        if (!this._arrayRgba)
        {
            this._arrayRgba = [];
        }

        out ||= this._arrayRgba as T;
        const [r, g, b, a] = this._components;

        out[0] = r;
        out[1] = g;
        out[2] = b;
        out[3] = a;

        return out;
    }

    /**
     * Convert to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
     * @param {number[]|Float32Array} [out] - Optional output array. If not provided,
     * a cached array will be used and returned.
     * @returns Array containing RGB components as floats between 0-1
     * @example
     * ```ts
     * // Basic usage
     * new Color('white').toRgbArray(); // returns [1, 1, 1]
     * new Color('red').toRgbArray();   // returns [1, 0, 0]
     *
     * // Using custom output array
     * const rgb = new Float32Array(3);
     * new Color('blue').toRgbArray(rgb); // rgb is now [0, 0, 1]
     * ```
     * @remarks
     * - Output values are normalized between 0-1
     * - Alpha component is omitted from output
     * - Reuses internal cache array if no output array provided
     */
    public toRgbArray<T extends number[] | Float32Array = number[]>(out?: T): T
    {
        if (!this._arrayRgb)
        {
            this._arrayRgb = [];
        }

        out ||= this._arrayRgb as T;
        const [r, g, b] = this._components;

        out[0] = r;
        out[1] = g;
        out[2] = b;

        return out;
    }

    /**
     * Convert to a hexadecimal number.
     * @returns The color as a 24-bit RGB integer
     * @example
     * ```ts
     * // Basic usage
     * new Color('white').toNumber(); // returns 0xffffff
     * new Color('red').toNumber();   // returns 0xff0000
     *
     * // Store as hex
     * const color = new Color('blue');
     * const hex = color.toNumber(); // 0x0000ff
     * ```
     */
    public toNumber(): number
    {
        return this._int;
    }

    /**
     * Convert to a BGR number.
     *
     * Useful for platforms that expect colors in BGR format.
     * @returns The color as a 24-bit BGR integer
     * @example
     * ```ts
     * // Convert RGB to BGR
     * new Color(0xffcc99).toBgrNumber(); // returns 0x99ccff
     *
     * // Common use case: platform-specific color format
     * const color = new Color('orange');
     * const bgrColor = color.toBgrNumber(); // Color with swapped R/B channels
     * ```
     * @remarks
     * This swaps the red and blue channels compared to the normal RGB format:
     * - RGB 0xRRGGBB becomes BGR 0xBBGGRR
     */
    public toBgrNumber(): number
    {
        const [r, g, b] = this.toUint8RgbArray();

        return (b << 16) + (g << 8) + r;
    }

    /**
     * Convert to a hexadecimal number in little endian format (e.g., BBGGRR).
     *
     * Useful for platforms that expect colors in little endian byte order.
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Convert RGB color to little endian format
     * new Color(0xffcc99).toLittleEndianNumber(); // returns 0x99ccff
     *
     * // Common use cases:
     * const color = new Color('orange');
     * const leColor = color.toLittleEndianNumber(); // Swaps byte order for LE systems
     *
     * // Multiple conversions
     * const colors = {
     *     normal: 0xffcc99,
     *     littleEndian: new Color(0xffcc99).toLittleEndianNumber(), // 0x99ccff
     *     backToNormal: new Color(0x99ccff).toLittleEndianNumber()  // 0xffcc99
     * };
     * ```
     * @remarks
     * - Swaps R and B channels in the color value
     * - RGB 0xRRGGBB becomes 0xBBGGRR
     * - Useful for systems that use little endian byte order
     * - Can be used to convert back and forth between formats
     * @returns The color as a number in little endian format (BBGGRR)
     * @see {@link Color.toBgrNumber} For BGR format without byte swapping
     */
    public toLittleEndianNumber(): number
    {
        const value = this._int;

        return (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
    }

    /**
     * Multiply with another color.
     *
     * This action is destructive and modifies the original color.
     * @param {ColorSource} value - The color to multiply by. Accepts any valid color format:
     * - Hex strings/numbers (e.g., '#ff0000', 0xff0000)
     * - RGB/RGBA arrays ([1, 0, 0], [1, 0, 0, 1])
     * - Color objects ({ r: 1, g: 0, b: 0 })
     * - CSS color names ('red', 'blue')
     * @returns this - The Color instance for chaining
     * @example
     * ```ts
     * // Basic multiplication
     * const color = new Color('#ff0000');
     * color.multiply(0x808080); // 50% darker red
     *
     * // With transparency
     * color.multiply([1, 1, 1, 0.5]); // 50% transparent
     *
     * // Chain operations
     * color
     *     .multiply('#808080')
     *     .multiply({ r: 1, g: 1, b: 1, a: 0.5 });
     * ```
     * @remarks
     * - Multiplies each RGB component and alpha separately
     * - Values are clamped between 0-1
     * - Original color format is lost (value becomes null)
     * - Operation cannot be undone
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
     * Converts color to a premultiplied alpha format.
     *
     * This action is destructive and modifies the original color.
     * @param alpha - The alpha value to multiply by (0-1)
     * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels
     * @returns {Color} The Color instance for chaining
     * @example
     * ```ts
     * // Basic premultiplication
     * const color = new Color('red');
     * color.premultiply(0.5); // 50% transparent red with premultiplied RGB
     *
     * // Alpha only (RGB unchanged)
     * color.premultiply(0.5, false); // 50% transparent, original RGB
     *
     * // Chain with other operations
     * color
     *     .multiply(0x808080)
     *     .premultiply(0.5)
     *     .toNumber();
     * ```
     * @remarks
     * - RGB channels are multiplied by alpha when applyToRGB is true
     * - Alpha is always set to the provided value
     * - Values are clamped between 0-1
     * - Original color format is lost (value becomes null)
     * - Operation cannot be undone
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
     * Returns the color as a 32-bit premultiplied alpha integer.
     *
     * Format: 0xAARRGGBB
     * @param {number} alpha - The alpha value to multiply by (0-1)
     * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels
     * @returns {number} The premultiplied color as a 32-bit integer
     * @example
     * ```ts
     * // Convert to premultiplied format
     * const color = new Color('red');
     *
     * // Full opacity (0xFFRRGGBB)
     * color.toPremultiplied(1.0); // 0xFFFF0000
     *
     * // 50% transparency with premultiplied RGB
     * color.toPremultiplied(0.5); // 0x7F7F0000
     *
     * // 50% transparency without RGB premultiplication
     * color.toPremultiplied(0.5, false); // 0x7FFF0000
     * ```
     * @remarks
     * - Returns full opacity (0xFF000000) when alpha is 1.0
     * - Returns 0 when alpha is 0.0 and applyToRGB is true
     * - RGB values are rounded during premultiplication
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
     * Convert to a hexadecimal string (6 characters).
     * @returns A CSS-compatible hex color string (e.g., "#ff0000")
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Basic colors
     * new Color('red').toHex();    // returns "#ff0000"
     * new Color('white').toHex();  // returns "#ffffff"
     * new Color('black').toHex();  // returns "#000000"
     *
     * // From different formats
     * new Color(0xff0000).toHex(); // returns "#ff0000"
     * new Color([1, 0, 0]).toHex(); // returns "#ff0000"
     * new Color({ r: 1, g: 0, b: 0 }).toHex(); // returns "#ff0000"
     * ```
     * @remarks
     * - Always returns a 6-character hex string
     * - Includes leading "#" character
     * - Alpha channel is ignored
     * - Values are rounded to nearest hex value
     */
    public toHex(): string
    {
        const hexString = this._int.toString(16);

        return `#${'000000'.substring(0, 6 - hexString.length) + hexString}`;
    }

    /**
     * Convert to a hexadecimal string with alpha (8 characters).
     * @returns A CSS-compatible hex color string with alpha (e.g., "#ff0000ff")
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // Fully opaque colors
     * new Color('red').toHexa();   // returns "#ff0000ff"
     * new Color('white').toHexa(); // returns "#ffffffff"
     *
     * // With transparency
     * new Color('rgba(255, 0, 0, 0.5)').toHexa(); // returns "#ff00007f"
     * new Color([1, 0, 0, 0]).toHexa(); // returns "#ff000000"
     * ```
     * @remarks
     * - Returns an 8-character hex string
     * - Includes leading "#" character
     * - Alpha is encoded in last two characters
     * - Values are rounded to nearest hex value
     */
    public toHexa(): string
    {
        const alphaValue = Math.round(this._components[3] * 255);
        const alphaString = alphaValue.toString(16);

        return this.toHex() + '00'.substring(0, 2 - alphaString.length) + alphaString;
    }

    /**
     * Set alpha (transparency) value while preserving color components.
     *
     * Provides a chainable interface for setting alpha.
     * @param alpha - Alpha value between 0 (fully transparent) and 1 (fully opaque)
     * @returns The Color instance for chaining
     * @example
     * ```ts
     * // Basic alpha setting
     * const color = new Color('red');
     * color.setAlpha(0.5);  // 50% transparent red
     *
     * // Chain with other operations
     * color
     *     .setValue('#ff0000')
     *     .setAlpha(0.8)    // 80% opaque
     *     .premultiply(0.5); // Further modify alpha
     *
     * // Reset to fully opaque
     * color.setAlpha(1);
     * ```
     * @remarks
     * - Alpha value is clamped between 0-1
     * - Can be chained with other color operations
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

        // Number is a primitive so typeof works fine, but in the case
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
     * Check if a value can be interpreted as a valid color format.
     * Supports all color formats that can be used with the Color class.
     * @param value - Value to check
     * @returns True if the value can be used as a color
     * @example
     * ```ts
     * import { Color } from 'pixi.js';
     *
     * // CSS colors and hex values
     * Color.isColorLike('red');          // true
     * Color.isColorLike('#ff0000');      // true
     * Color.isColorLike(0xff0000);       // true
     *
     * // Arrays (RGB/RGBA)
     * Color.isColorLike([1, 0, 0]);      // true
     * Color.isColorLike([1, 0, 0, 0.5]); // true
     *
     * // TypedArrays
     * Color.isColorLike(new Float32Array([1, 0, 0]));          // true
     * Color.isColorLike(new Uint8Array([255, 0, 0]));          // true
     * Color.isColorLike(new Uint8ClampedArray([255, 0, 0]));   // true
     *
     * // Object formats
     * Color.isColorLike({ r: 1, g: 0, b: 0 });            // true (RGB)
     * Color.isColorLike({ r: 1, g: 0, b: 0, a: 0.5 });    // true (RGBA)
     * Color.isColorLike({ h: 0, s: 100, l: 50 });         // true (HSL)
     * Color.isColorLike({ h: 0, s: 100, l: 50, a: 0.5 }); // true (HSLA)
     * Color.isColorLike({ h: 0, s: 100, v: 100 });        // true (HSV)
     * Color.isColorLike({ h: 0, s: 100, v: 100, a: 0.5 });// true (HSVA)
     *
     * // Color instances
     * Color.isColorLike(new Color('red')); // true
     *
     * // Invalid values
     * Color.isColorLike(null);           // false
     * Color.isColorLike(undefined);      // false
     * Color.isColorLike({});             // false
     * Color.isColorLike([]);             // false
     * Color.isColorLike('not-a-color');  // false
     * ```
     * @remarks
     * Checks for the following formats:
     * - Numbers (0x000000 to 0xffffff)
     * - CSS color strings
     * - RGB/RGBA arrays and objects
     * - HSL/HSLA objects
     * - HSV/HSVA objects
     * - TypedArrays (Float32Array, Uint8Array, Uint8ClampedArray)
     * - Color instances
     * @see {@link ColorSource} For supported color format types
     * @see {@link Color.setValue} For setting color values
     * @category utility
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

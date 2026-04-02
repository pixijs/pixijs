import { Color } from '../../../color/Color';
import { type ColorMatrix, ColorMatrixFilter } from './ColorMatrixFilter';

import type { ColorSource } from '../../../color/Color';
import type { FilterOptions } from '../../Filter';

/**
 * Options for ColorMatrixFilter
 * @category filters
 * @standard
 */
export interface ColorTransformFilterOptions extends FilterOptions
{
    /**
     * The opacity value used to blend between the original and transformed colors.
     * @see {@link ColorMatrixFilter.alpha}
     */
    alpha?: number;
}

/**
 * The ColorTransformFilter class lets you apply color transformations to display objects using a 5x4 matrix.
 * The matrix transforms the RGBA color and alpha values of every pixel to produce a new set of values.
 *
 * The class provides convenient methods for common color adjustments like brightness, contrast, saturation,
 * and various photo filter effects. If you only want an easy way to apply color transformations using a 5x4
 * matrix you can use {@link MatrixFilter} instead.
 * @example
 * ```js
 * import { ColorTransformFilter } from 'pixi.js';
 *
 * // Create a new color matrix filter
 * const colorMatrix = new ColorTransformFilter();
 *
 * // Apply it to a container
 * container.filters = [colorMatrix];
 *
 * // Adjust contrast
 * colorMatrix.contrast(2);
 *
 * // Chain multiple effects
 * colorMatrix
 *     .saturate(0.5)         // 50% saturation
 *     .brightness(1.2, true) // 20% brighter
 *     .hue(90, true);        // 90 degree hue rotation
 * ```
 *
 * Common use cases:
 * - Adjusting brightness, contrast, or saturation
 * - Applying color tints or color grading
 * - Creating photo filter effects (sepia, negative, etc.)
 * - Converting to grayscale
 * - Implementing dynamic day/night transitions
 * @author Clément Chenebault <clement@goodboydigital.com>
 * @category filters
 * @standard
 * @noInheritDoc
 */
export class ColorTransformFilter extends ColorMatrixFilter
{
    constructor(options?: ColorTransformFilterOptions)
    {
        super({
            matrix: [
                1, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0,
            ],
            ...options,
        });
    }
    /**
     * Transforms current matrix and set the new one
     * @param {number[]} matrix - 5x4 matrix
     * @param multiply - if true, current matrix and matrix are multiplied. If false,
     *  just set the current matrix with matrix
     */
    private _loadMatrix(matrix: ColorMatrix, multiply = false): void
    {
        if (multiply)
        {
            const newMatrix = [...matrix] as ColorMatrix;

            this._multiply(newMatrix, this.matrix, matrix);
            this.resources.colorMatrixUniforms.uniforms.uColorMatrix = newMatrix;
        }
        else
        {
            this.resources.colorMatrixUniforms.uniforms.uColorMatrix = matrix;
        }

        // set the new matrix

        this.resources.colorMatrixUniforms.update();
    }

    /**
     * Adjusts the brightness of a display object.
     *
     * The brightness adjustment works by multiplying the RGB channels by a scalar value while keeping
     * the alpha channel unchanged. Values below 1 darken the image, while values above 1 brighten it.
     * @param b - The brightness multiplier to apply.
     *  - Values between 0-1 darken the image (0 being black)
     *  - Values greater than 1 brighten it (2.0 would make it twice as bright)
     * @param multiply - When true, the new matrix is multiplied with the current one instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * // Create a new color matrix filter
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Darken the image to 50% brightness
     * colorMatrix.brightness(0.5);
     *
     * // Chain with other effects by using multiply
     * colorMatrix
     *     .brightness(1.2)      // Brighten by 20%
     *     .saturate(1.1, true); // Increase saturation by 10%
     * ```
     */
    public brightness(b: number, multiply = false): this
    {
        const matrix: ColorMatrix = [
            b, 0, 0, 0, 0,
            0, b, 0, 0, 0,
            0, 0, b, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Sets each channel on the diagonal of the color matrix to apply a color tint.
     *
     * This method provides a way to tint display objects using the color matrix filter, similar to
     * the tint property available on Sprites and other display objects. The tint is applied by
     * scaling the RGB channels of each pixel.
     * @param color - The color to use for tinting, this can be any valid color source.
     * @param multiply - When true, the new tint matrix is multiplied with the current matrix instead
     *                  of replacing it. This allows for combining tints with other color effects.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply a red tint
     * colorMatrix.tint(0xff0000);
     *
     * // Layer a green tint on top of existing effects
     * colorMatrix.tint('green', true);
     *
     * // Chain with other color adjustments
     * colorMatrix
     *     .tint('blue')           // Blue tint
     *     .brightness(1.2, true); // Increase brightness
     * ```
     */
    public tint(color: ColorSource, multiply = false): this
    {
        const [r, g, b] = Color.shared.setValue(color).toArray();
        const matrix: ColorMatrix = [
            r, 0, 0, 0, 0,
            0, g, 0, 0, 0,
            0, 0, b, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Converts the display object to greyscale by applying a weighted matrix transformation.
     *
     * The greyscale effect works by setting equal RGB values for each pixel based on the scale parameter,
     * effectively removing color information while preserving luminance.
     * @param scale - The intensity of the grayscale effect. Range is 0 to 1.
     * - `0` produces black
     * - `0.5` produces 50% grey
     * - `1` produces white
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Convert to 50% grey
     * colorMatrix.greyscale(0.5);
     *
     * // Chain with other effects
     * colorMatrix
     *     .greyscale(0.6)         // Add grey tint
     *     .brightness(1.2, true); // Brighten the result
     * ```
     */
    public greyscale(scale: number, multiply = false): this
    {
        const matrix: ColorMatrix = [
            scale, scale, scale, 0, 0,
            scale, scale, scale, 0, 0,
            scale, scale, scale, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * @param scale
     * @param multiply
     * @see {@link greyscale}
     */
    public grayscale(scale: number, multiply = false): this
    {
        return this.greyscale(scale, multiply);
    }

    /**
     * Converts the display object to pure black and white using a luminance-based threshold.
     *
     * This method applies a matrix transformation that removes all color information and reduces
     * the image to just black and white values based on the luminance of each pixel. The transformation
     * uses standard luminance weightings: 30% red, 60% green, and 10% blue.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Convert to black and white
     * colorMatrix.blackAndWhite();
     *
     * // Chain with other effects
     * colorMatrix
     *     .blackAndWhite()        // Apply B&W effect
     *     .brightness(1.2, true); // Then increase brightness
     * ```
     */
    public blackAndWhite(multiply = false): this
    {
        const matrix: ColorMatrix = [
            0.3, 0.6, 0.1, 0, 0,
            0.3, 0.6, 0.1, 0, 0,
            0.3, 0.6, 0.1, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Adjusts the hue of the display object by rotating the color values around the color wheel.
     *
     * This method uses an optimized matrix transformation that accurately rotates the RGB color space
     * around its luminance axis. The implementation is based on RGB cube rotation in 3D space, providing
     * better results than traditional matrices with magic luminance constants.
     * @param rotation - The angle of rotation in degrees around the color wheel:
     * - 0 = no change
     * - 90 = rotate colors 90° clockwise
     * - 180 = invert all colors
     * - 270 = rotate colors 90° counter-clockwise
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Rotate hue by 90 degrees
     * colorMatrix.hue(90);
     *
     * // Chain multiple color adjustments
     * colorMatrix
     *     .hue(45)                // Rotate colors by 45°
     *     .saturate(1.2, true)    // Increase saturation
     *     .brightness(1.1, true); // Slightly brighten
     * ```
     */
    public hue(rotation: number, multiply = false): this
    {
        rotation = ((rotation || 0) / 180) * Math.PI;

        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const sqrt = Math.sqrt;

        /* a good approximation for hue rotation
         This matrix is far better than the versions with magic luminance constants
         formerly used here, but also used in the starling framework (flash) and known from this
         old part of the internet: quasimondo.com/archives/000565.php

         This new matrix is based on rgb cube rotation in space. Look here for a more descriptive
         implementation as a shader not a general matrix:
         https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/adjust/huesaturation.js

         This is the source for the code:
         see http://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color/8510751#8510751
         */

        const w = 1 / 3;
        const sqrW = sqrt(w); // weight is

        const a00 = cosR + ((1.0 - cosR) * w);
        const a01 = (w * (1.0 - cosR)) - (sqrW * sinR);
        const a02 = (w * (1.0 - cosR)) + (sqrW * sinR);

        const a10 = (w * (1.0 - cosR)) + (sqrW * sinR);
        const a11 = cosR + (w * (1.0 - cosR));
        const a12 = (w * (1.0 - cosR)) - (sqrW * sinR);

        const a20 = (w * (1.0 - cosR)) - (sqrW * sinR);
        const a21 = (w * (1.0 - cosR)) + (sqrW * sinR);
        const a22 = cosR + (w * (1.0 - cosR));

        const matrix: ColorMatrix = [
            a00, a01, a02, 0, 0,
            a10, a11, a12, 0, 0,
            a20, a21, a22, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Adjusts the contrast of the display object by modifying the separation between dark and bright values.
     *
     * This method applies a matrix transformation that affects the difference between dark and light areas
     * in the image. Increasing contrast makes shadows darker and highlights brighter, while decreasing
     * contrast brings shadows up and highlights down, reducing the overall dynamic range.
     * @param amount - The contrast adjustment value. Range is -1 to 1.
     *  - `-1` represents minimum contrast (flat gray)
     *  - `0` represents normal contrast
     *  - `1` represents maximum contrast
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Increase contrast by 50%
     * colorMatrix.contrast(0.5);
     *
     * // Chain with other effects
     * colorMatrix
     *     .contrast(0.1)         // Boost contrast
     *     .brightness(1.1, true) // Slightly brighten
     *     .saturate(1.2, true);  // Increase color intensity
     * ```
     */
    public contrast(amount: number, multiply = false): this
    {
        const v = (amount || 0) + 1;
        const o = -0.5 * (v - 1);

        const matrix: ColorMatrix = [
            v, 0, 0, 0, o,
            0, v, 0, 0, o,
            0, 0, v, 0, o,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Adjusts the saturation of the display object by modifying color separation.
     *
     * This method applies a matrix transformation that affects the intensity of colors.
     * Increasing saturation makes colors more vivid and intense, while decreasing saturation
     * moves colors toward grayscale.
     * @param amount - The saturation adjustment value. Range is -1 to 1.
     *  - `-1` produces grayscale
     *  - `0` represents no change
     *  - `1` produces maximum saturation
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Double the saturation
     * colorMatrix.saturate(1);
     *
     * // Chain with other effects
     * colorMatrix
     *     .saturate(0.5)         // Increase saturation by 50%
     *     .brightness(1.1, true) // Slightly brighten
     *     .contrast(-0.2, true); // Reduce contrast
     * ```
     */
    public saturate(amount = 0, multiply = false): this
    {
        const x = ((amount * 2) / 3) + 1;
        const y = (x - 1) * -0.5;

        const matrix: ColorMatrix = [
            x, y, y, 0, 0,
            y, x, y, 0, 0,
            y, y, x, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Completely removes color information from the display object, creating a grayscale version.
     *
     * This is a convenience method that calls `saturate(-1)` internally. The transformation preserves
     * the luminance of the original image while removing all color information.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Convert image to grayscale
     * colorMatrix.desaturate();
     *
     * // Can be chained with other effects
     * colorMatrix
     *     .desaturate()     // Remove all color
     *     .brightness(1.2); // Then increase brightness
     * ```
     */
    public desaturate(multiply = false): this
    {
        return this.saturate(-1, multiply);
    }

    /**
     * Creates a negative effect by inverting all colors in the display object.
     *
     * This method applies a matrix transformation that inverts the RGB values of each pixel
     * while preserving the alpha channel. The result is similar to a photographic negative.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Create negative effect
     * colorMatrix.negative();
     *
     * // Chain with other effects
     * colorMatrix
     *     .negative()            // Apply negative effect
     *     .brightness(1.2, true) // Increase brightness
     *     .contrast(-0.2, true); // Reduce contrast
     * ```
     */
    public negative(multiply = false): this
    {
        const matrix: ColorMatrix = [
            -1, 0, 0, 1, 0,
            0, -1, 0, 1, 0,
            0, 0, -1, 1, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a sepia tone effect to the display object, creating a warm brown tint reminiscent of vintage photographs.
     *
     * This method applies a matrix transformation that converts colors to various shades of brown while
     * preserving the original luminance values.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply sepia effect
     * colorMatrix.sepia();
     *
     * // Chain with other effects
     * colorMatrix
     *     .sepia()               // Add sepia tone
     *     .brightness(1.1, true) // Slightly brighten
     *     .contrast(-0.1, true); // Reduce contrast
     * ```
     */
    public sepia(multiply = false): this
    {
        const matrix: ColorMatrix = [
            0.393, 0.7689999, 0.18899999, 0, 0,
            0.349, 0.6859999, 0.16799999, 0, 0,
            0.272, 0.5339999, 0.13099999, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a Technicolor-style effect that simulates the early color motion picture process.
     *
     * This method applies a matrix transformation that recreates the distinctive look of the
     * Technicolor process. The effect produces highly
     * saturated colors with a particular emphasis on reds, greens, and blues.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply Technicolor effect
     * colorMatrix.technicolor();
     *
     * // Chain with other effects
     * colorMatrix
     *     .technicolor()          // Add Technicolor effect
     *     .contrast(0.1, true)    // Boost contrast
     *     .brightness(0.9, true); // Slightly darken
     * ```
     */
    public technicolor(multiply = false): this
    {
        const matrix: ColorMatrix = [
            1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 0.046249425232852304,
            -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -0.2758903984886823,
            -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 0.12137623870388682,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a vintage Polaroid camera effect to the display object.
     *
     * This method applies a matrix transformation that simulates the distinctive look of
     * Polaroid instant photographs, characterized by slightly enhanced contrast, subtle color shifts,
     * and a warm overall tone.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply Polaroid effect
     * colorMatrix.polaroid();
     *
     * // Chain with other effects
     * colorMatrix
     *     .polaroid()            // Add Polaroid effect
     *     .brightness(1.1, true) // Slightly brighten
     *     .contrast(0.1, true);  // Boost contrast
     * ```
     */
    public polaroid(multiply = false): this
    {
        const matrix: ColorMatrix = [
            1.438, -0.062, -0.062, 0, 0,
            -0.122, 1.378, -0.122, 0, 0,
            -0.016, -0.016, 1.483, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Swaps the red and blue color channels in the display object.
     *
     * This method applies a matrix transformation that exchanges the red and blue color values
     * while keeping the green channel and alpha unchanged.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Swap red and blue channels
     * colorMatrix.toBGR();
     *
     * // Chain with other effects
     * colorMatrix
     *     .toBGR()               // Swap R and B channels
     *     .brightness(1.1, true) // Slightly brighten
     *     .contrast(-0.1, true); // Reduce contrast
     * ```
     */
    public toBGR(multiply = false): this
    {
        const matrix: ColorMatrix = [
            0, 0, 1, 0, 0,
            0, 1, 0, 0, 0,
            1, 0, 0, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a Kodachrome color effect that simulates the iconic film stock.
     *
     * This method applies a matrix transformation that recreates the distinctive look of Kodachrome film,
     * known for its rich, vibrant colors and excellent image preservation qualities. The effect emphasizes
     * reds and blues while producing deep, true blacks.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply Kodachrome effect
     * colorMatrix.kodachrome();
     *
     * // Chain with other effects
     * colorMatrix
     *     .kodachrome()           // Add Kodachrome effect
     *     .contrast(0.1, true)    // Boost contrast
     *     .brightness(0.9, true); // Slightly darken
     * ```
     */
    public kodachrome(multiply = false): this
    {
        const matrix: ColorMatrix = [
            1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 0.24991995145868634,
            -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 0.09698983488904393,
            -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 0.13972481597886063,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a stylized brown-tinted effect to the display object.
     *
     * This method applies a matrix transformation that creates a rich, warm brown tone
     * with enhanced contrast and subtle color shifts.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply browni effect
     * colorMatrix.browni();
     *
     * // Chain with other effects
     * colorMatrix
     *     .browni()              // Add brown tint
     *     .brightness(1.1, true) // Slightly brighten
     *     .contrast(0.2, true);  // Boost contrast
     * ```
     */
    public browni(multiply = false): this
    {
        const matrix: ColorMatrix = [
            0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 0.1860075629647401,
            -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -0.14497417640467167,
            0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -0.029655197167024642,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a vintage photo effect that simulates old photography techniques.
     *
     * This method applies a matrix transformation that creates a nostalgic, aged look
     * with muted colors, enhanced warmth, and subtle vignetting.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply vintage effect
     * colorMatrix.vintage();
     *
     * // Chain with other effects
     * colorMatrix
     *     .vintage()             // Add vintage look
     *     .brightness(0.9, true) // Slightly darken
     *     .contrast(0.1, true);  // Boost contrast
     * ```
     */
    public vintage(multiply = false): this
    {
        const matrix: ColorMatrix = [
            0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 0.037848179746251466,
            0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 0.029265996770472907,
            0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 0.020232119953863904,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * We don't know exactly what it does, kind of gradient map, but funny to play with!
     * @param desaturation - Tone values.
     * @param toned - Tone values.
     * @param lightColor - Tone values, example: `0xFFE580`
     * @param darkColor - Tone values, example: `0xFFE580`
     * @param multiply - if true, current matrix and matrix are multiplied. If false,
     *  just set the current matrix with matrix
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Create sepia-like effect with custom colors
     * colorMatrix.colorTone(
     *     0.3,        // Moderate desaturation
     *     0.2,        // Moderate toning
     *     0xFFE580,   // Warm highlight color
     *     0x338000,   // Dark green shadows
     * );
     *
     * // Chain with other effects
     * colorMatrix
     *     .colorTone(0.2, 0.15, 0xFFE580, 0x338000)
     *     .brightness(1.1, true); // Slightly brighten
     * ```
     */
    public colorTone(
        desaturation = 0.2,
        toned = 0.15,
        lightColor: ColorSource = 0xffe580,
        darkColor: ColorSource = 0x338000,
        multiply = false,
    ): this
    {
        const temp = Color.shared;
        const [lR, lG, lB] = temp.setValue(lightColor).toArray();
        const [dR, dG, dB] = temp.setValue(darkColor).toArray();

        const matrix: ColorMatrix = [
            0.3, 0.59, 0.11, 0, 0,
            lR, lG, lB, desaturation, 0,
            dR, dG, dB, toned, 0,
            lR - dR, lG - dG, lB - dB, 0, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a night vision effect to the display object.
     *
     * This method applies a matrix transformation that simulates night vision by enhancing
     * certain color channels while suppressing others, creating a green-tinted effect
     * similar to night vision goggles.
     * @param intensity - The intensity of the night effect. Range is 0 to 1.
     *  - `0` produces no effect
     *  - `0.1` produces a subtle night vision effect (default)
     *  - `1` produces maximum night vision effect
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply night vision effect
     * colorMatrix.night(0.3);
     *
     * // Chain with other effects
     * colorMatrix
     *     .night(0.2)            // Add night vision
     *     .brightness(1.1, true) // Slightly brighten
     *     .contrast(0.2, true);  // Boost contrast
     * ```
     */
    public night(intensity = 0.1, multiply = false): this
    {
        const matrix: ColorMatrix = [
            intensity * -2.0, -intensity, 0, 0, 0,
            -intensity, 0, intensity, 0, 0,
            0, intensity, intensity * 2.0, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Predator effect
     * @param amount - how much the predator feels his future victim
     * @param multiply - if true, current matrix and matrix are multiplied. If false,
     *  just set the current matrix with matrix
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply thermal vision effect
     * colorMatrix.predator(0.5);
     *
     * // Chain with other effects
     * colorMatrix
     *     .predator(0.3)          // Add thermal effect
     *     .contrast(0.2, true)    // Boost contrast
     *     .brightness(1.1, true); // Slightly brighten
     * ```
     */
    public predator(amount: number, multiply = false): this
    {
        const matrix: ColorMatrix = [
            // row 1
            11.224130630493164 * amount,
            -4.794486999511719 * amount,
            -2.8746118545532227 * amount,
            0 * amount,
            0.40342438220977783 * amount,
            // row 2
            -3.6330697536468506 * amount,
            9.193157196044922 * amount,
            -2.951810836791992 * amount,
            0 * amount,
            -1.316135048866272 * amount,
            // row 3
            -3.2184197902679443 * amount,
            -4.2375030517578125 * amount,
            7.476448059082031 * amount,
            0 * amount,
            0.8044459223747253 * amount,
            // row 4
            0,
            0,
            0,
            1,
            0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Applies a psychedelic color effect that creates dramatic color shifts.
     *
     * This method applies a matrix transformation that produces vibrant colors
     * through channel mixing and amplification. Creates an effect reminiscent of
     * color distortions in psychedelic art.
     * @param multiply - When true, the new matrix is multiplied with the current matrix instead of replacing it.
     *                  This allows for cumulative effects when calling multiple color adjustments.
     * @returns `this` for chaining.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply psychedelic effect
     * colorMatrix.lsd();
     *
     * // Chain with other effects
     * colorMatrix
     *     .lsd()                 // Add color distortion
     *     .brightness(0.9, true) // Slightly darken
     *     .contrast(0.2, true);  // Boost contrast
     * ```
     */
    public lsd(multiply = false): this
    {
        const matrix: ColorMatrix = [
            2, -0.4, 0.5, 0, 0,
            -0.5, 2, -0.4, 0, 0,
            -0.4, -0.5, 3, 0, 0,
            0, 0, 0, 1, 0,
        ];

        this._loadMatrix(matrix, multiply);

        return this;
    }

    /**
     * Resets the color matrix filter to its default state.
     *
     * This method resets all color transformations by setting the matrix back to its identity state.
     * The identity matrix leaves colors unchanged, effectively removing all previously applied effects.
     * @example
     * ```ts
     * const colorMatrix = new ColorMatrixFilter();
     *
     * // Apply some effects
     * colorMatrix
     *     .sepia()
     *     .brightness(1.2, true);
     *
     * // Reset back to original colors and alpha
     * colorMatrix.reset();
     * ```
     */
    public reset(): void
    {
        this.alpha = 1;

        this._loadMatrix([
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ], false);
    }
}

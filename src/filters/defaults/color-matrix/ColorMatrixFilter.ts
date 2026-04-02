import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './colorMatrixFilter.frag';
import source from './colorMatrixFilter.wgsl';
import { ColorTransformFilter } from './ColorTransformFilter';
import { type ColorSource } from '~/color';
import { deprecation } from '~/utils';

import type { ArrayFixed } from '../../../utils/types';
import type { FilterOptions } from '../../Filter';

/**
 * 5x4 matrix for transforming RGBA color and alpha
 *
 * The rows are in order:
 * - Red channel
 * - Green channel
 * - Blue channel
 * - Alpha channel
 *
 * The columns are:
 * - How much to multiply the red channel into this channel by
 * - How much to multiply the green channel into this channel by
 * - How much to multiply the blue channel into this channel by
 * - How much to multiply the alpha channel into this channel by
 * - How far to offset the row's channel
 * @category filters
 * @standard
 */
export type ColorMatrix = ArrayFixed<number, 20>;

/**
 * Options for MatrixFilter
 * @category filters
 * @standard
 */
export interface ColorMatrixFilterOptions extends FilterOptions
{
    /**
     * The opacity value used to blend between the original and transformed colors.
     * @see {@link MatrixFilter.alpha}
     */
    alpha?: number;

    /**
     * The color transformation matrix.
     * @see {@link MatrixFilter.matrix}
     */
    matrix?: ColorMatrix;
}

/**
 * The MatrixFilter class lets you apply color transformations to display objects using a 5x4 matrix.
 * The matrix transforms the RGBA color and alpha values of every pixel to produce a new set of values.
 * @example
 * ```js
 * import { MatrixFilter } from 'pixi.js';
 *
 * // Create a new color matrix filter with a matrix that swap the red channel to the blue and green channel
 * // and the blue channel to the red. Keep alpha.
 * const matrixFilter = new MatrixFilter({
 *      matrix: [
 *          0, 0, 1, 0, 0,
 *          1, 0, 0, 0, 0,
 *          1, 0, 0, 0, 0,
 *          0, 0, 0, 1, 0,
 *      ]
 * });
 *
 * // Apply it to a container
 * container.filters = [matrixFilter];
 * ```
 * @author Clément Chenebault <clement@goodboydigital.com>
 * @category filters
 * @standard
 * @noInheritDoc
 */
export class ColorMatrixFilter extends Filter
{
    /**
     * Default options for the MatrixFilter.
     * @example
     * ```ts
     * MatrixFilter.defaultOptions = {
     *      matrix: [
     *          0.5, 0, 1, 0, 0,
     *          0, 0.5, 1, 0, 0,
     *          0, 0, 0.5, 0, 0,
     *          0, 0, 0, 0.5, 0
     *      ]
     * };
     * // Use default options
     * const filter = new MatrixFilter(); // Uses a copy of the above defined matrix
     * ```
     */
    public static defaultOptions: ColorMatrixFilterOptions = {
        alpha: 1,
        matrix: [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ],
    };
    constructor(options?: ColorMatrixFilterOptions)
    {
        const { matrix, alpha, ...rest } = {
            ...ColorMatrixFilter.defaultOptions,
            ...options,
        };
        const colorMatrixUniforms = new UniformGroup({
            uColorMatrix: {
                value: matrix ?? [...ColorMatrixFilter.defaultOptions.matrix],
                type: 'f32',
                size: 20,
            },
            uAlpha: {
                value: alpha,
                type: 'f32',
            },
        });

        const gpuProgram = GpuProgram.from({
            vertex: {
                source,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source,
                entryPoint: 'mainFragment',
            },
        });

        const glProgram = GlProgram.from({
            vertex,
            fragment,
            name: 'color-matrix-filter',
        });

        super({
            ...rest,
            gpuProgram,
            glProgram,
            resources: {
                colorMatrixUniforms,
            },
        });
    }

    /**
     * Multiplies two mat5x4's and stores the result in the first argument.
     *
     * All parameters must be different references.
     * @private
     * @param a - 5x4 matrix the first operand
     * @param b - 5x4 matrix the second operand
     * @param result - 5x4 matrix the receiving matrix
     * @returns {ColorMatrix} 5x4 matrix
     */
    protected _multiply(
        a: ColorMatrix,
        b: ColorMatrix,
        result: ColorMatrix = [
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
        ],
    ): ColorMatrix
    {
        // Red Channel
        result[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
        result[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
        result[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
        result[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
        result[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]) + a[4];

        // Green Channel
        result[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
        result[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
        result[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
        result[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
        result[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]) + a[9];

        // Blue Channel
        result[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
        result[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
        result[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
        result[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
        result[14]
			= (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]) + a[14];

        // Alpha Channel
        result[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
        result[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
        result[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
        result[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
        result[19]
			= (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]) + a[19];

        return result;
    }

    /**
     * Prepends the given {@link ColorMatrix} to the filter's matrix.
     *
     * Combines the two matrices by multiplying them together: `this = matrix * this`
     *
     * Creates a new array and assignes that to {@link matrix}.
     * @param matrix - 5x4 matrix
     * @returns `this` for chaining.
     */
    public prepend(matrix: ColorMatrix): this
    {
        this.matrix = this._multiply(matrix, this.matrix);

        return this;
    }

    /**
     * Appends the given {@link ColorMatrix} to the filter's matrix.
     *
     * Combines the two matrices by multiplying them together: `this = this * matrix`
     *
     * Creates a new array and assignes that to {@link matrix}.
     * @param matrix - 5x4 matrix
     * @returns `this` for chaining.
     */
    public append(matrix: ColorMatrix): this
    {
        this.matrix = this._multiply(this.matrix, matrix);

        return this;
    }

    /**
     * The current color transformation matrix of the filter.
     *
     * This 5x4 matrix transforms RGBA color and alpha values of each pixel. The matrix is stored
     * as a 20-element array in row-major order.
     * @type {ColorMatrix}
     * @default ```js
     * [
     *     1, 0, 0, 0, 0,  // Red channel
     *     0, 1, 0, 0, 0,  // Green channel
     *     0, 0, 1, 0, 0,  // Blue channel
     *     0, 0, 0, 1, 0   // Alpha channel
     * ]
     * ```
     * @example
     * ```ts
     * const matrixFilter = new MatrixFilter();
     * // Get the current matrix
     * const currentMatrix = matrixFilter.matrix;
     * // Modify the matrix
     * matrixFilter.matrix = [
     *     1, 0, 0, 0, 0,
     *     0, 1, 0, 0, 0,
     *     0, 0, 1, 0, 0,
     *     0, 0, 0, 1, 0
     * ];
     * ```
     */
    get matrix(): ColorMatrix
    {
        return this.resources.colorMatrixUniforms.uniforms.uColorMatrix;
    }

    set matrix(value: ColorMatrix)
    {
        this.resources.colorMatrixUniforms.uniforms.uColorMatrix = value;
    }

    /**
     * The opacity value used to blend between the original and transformed colors.
     *
     * This value controls how much of the color transformation is applied:
     * - `0` gives original color only (no effect)
     * - `0.5` gives a 50% blend of original and transformed colors
     * - `1` gives the fully transformed color (default)
     * @default 1
     */
    get alpha(): number
    {
        return this.resources.colorMatrixUniforms.uniforms.uAlpha;
    }

    set alpha(value: number)
    {
        this.resources.colorMatrixUniforms.uniforms.uAlpha = value;
    }

    /**
     * @param b
     * @param multiply
     * @deprecated
     */
    public brightness(b: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.brightness has been moved to ColorTransformFilter.brightness');
        ColorTransformFilter.prototype.brightness.call(this, b, multiply);

        return this;
    }
    /**
     * @param color
     * @param multiply
     * @deprecated
     */
    public tint(color: ColorSource, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.tint has been moved to ColorTransformFilter.tint');
        ColorTransformFilter.prototype.tint.call(this, color, multiply);

        return this;
    }
    /**
     * @param scale
     * @param multiply
     * @deprecated
     */
    public greyscale(scale: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.greyscale has been moved to ColorTransformFilter.greyscale');
        ColorTransformFilter.prototype.greyscale.call(this, scale, multiply);

        return this;
    }
    /**
     * @param scale
     * @param multiply
     * @deprecated
     */
    public grayscale(scale: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.grayscale has been moved to ColorTransformFilter.grayscale');
        ColorTransformFilter.prototype.grayscale.call(this, scale, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public blackAndWhite(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.blackAndWhite has been moved to ColorTransformFilter.blackAndWhite');
        ColorTransformFilter.prototype.blackAndWhite.call(this, multiply);

        return this;
    }
    /**
     * @param rotation
     * @param multiply
     * @deprecated
     */
    public hue(rotation: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.hue has been moved to ColorTransformFilter.hue');
        ColorTransformFilter.prototype.hue.call(this, rotation, multiply);

        return this;
    }
    /**
     * @param amount
     * @param multiply
     * @deprecated
     */
    public contrast(amount: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.contrast has been moved to ColorTransformFilter.contrast');
        ColorTransformFilter.prototype.contrast.call(this, amount, multiply);

        return this;
    }
    /**
     * @param amount
     * @param multiply
     * @deprecated
     */
    public saturate(amount?: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.saturate has been moved to ColorTransformFilter.saturate');
        ColorTransformFilter.prototype.saturate.call(this, amount, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public desaturate(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.desaturate has been moved to ColorTransformFilter.desaturate');
        ColorTransformFilter.prototype.desaturate.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public negative(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.negative has been moved to ColorTransformFilter.negative');
        ColorTransformFilter.prototype.negative.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public sepia(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.sepia has been moved to ColorTransformFilter.sepia');
        ColorTransformFilter.prototype.sepia.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public technicolor(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.technicolor has been moved to ColorTransformFilter.technicolor');
        ColorTransformFilter.prototype.technicolor.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public polaroid(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.polaroid has been moved to ColorTransformFilter.polaroid');
        ColorTransformFilter.prototype.polaroid.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public toBGR(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.toBGR has been moved to ColorTransformFilter.toBGR');
        ColorTransformFilter.prototype.toBGR.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public kodachrome(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.kodachrome has been moved to ColorTransformFilter.kodachrome');
        ColorTransformFilter.prototype.kodachrome.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public browni(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.browni has been moved to ColorTransformFilter.browni');
        ColorTransformFilter.prototype.browni.call(this, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public vintage(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.vintage has been moved to ColorTransformFilter.vintage');
        ColorTransformFilter.prototype.vintage.call(this, multiply);

        return this;
    }
    /**
     * @param desaturation
     * @param toned
     * @param lightColor
     * @param darkColor
     * @deprecated
     */
    public colorTone(desaturation?: number, toned?: number, lightColor?: ColorSource, darkColor?: ColorSource): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.colorTone has been moved to ColorTransformFilter.colorTone');
        ColorTransformFilter.prototype.colorTone.call(this, desaturation, toned, lightColor, darkColor);

        return this;
    }
    /**
     * @param intensity
     * @param multiply
     * @deprecated
     */
    public night(intensity: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.night has been moved to ColorTransformFilter.night');
        ColorTransformFilter.prototype.night.call(this, intensity, multiply);

        return this;
    }
    /**
     * @param amount
     * @param multiply
     * @deprecated
     */
    public predator(amount: number, multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.predator has been moved to ColorTransformFilter.predator');
        ColorTransformFilter.prototype.predator.call(this, amount, multiply);

        return this;
    }
    /**
     * @param multiply
     * @deprecated
     */
    public lsd(multiply?: boolean): this
    {
        deprecation('8.18.0', 'Moved ColorMatrixFilter.lsd has been moved to ColorTransformFilter.lsd');
        ColorTransformFilter.prototype.lsd.call(this, multiply);

        return this;
    }
}

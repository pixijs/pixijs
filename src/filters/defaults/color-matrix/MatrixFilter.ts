import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { type ArrayFixed } from '../../../utils/types';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './colorMatrixFilter.frag';
import source from './colorMatrixFilter.wgsl';

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
export interface MatrixFilterOptions extends FilterOptions
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
export class MatrixFilter extends Filter
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
    public static defaultOptions: MatrixFilterOptions = {
        alpha: 1,
        matrix: [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
        ],
    };
    constructor(options?: MatrixFilterOptions)
    {
        const { matrix, alpha, ...rest } = { ...MatrixFilter.defaultOptions, ...options };
        const colorMatrixUniforms = new UniformGroup({
            uColorMatrix: {
                value: matrix ?? [...MatrixFilter.defaultOptions.matrix],
                type: 'f32',
                size: 20,
            },
            uAlpha: {
                value: alpha,
                type: 'f32'
            }
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
            name: 'color-matrix-filter'
        });

        super({
            ...rest,
            gpuProgram,
            glProgram,
            resources: {
                colorMatrixUniforms
            },
        });
    }

    /**
     * Multiplies two mat5x4's and stores the result in the first argument.
     *
     * All parameters must be different references.
     * @private
     * @param result - 5x4 matrix the receiving matrix
     * @param a - 5x4 matrix the first operand
     * @param b - 5x4 matrix the second operand
     * @returns {number[]} 5x4 matrix
     */
    protected _multiply(result: ColorMatrix, a: ColorMatrix, b: ColorMatrix): ColorMatrix
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
        result[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]) + a[14];

        // Alpha Channel
        result[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
        result[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
        result[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
        result[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
        result[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]) + a[19];

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
        this.matrix = this._multiply([
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0
        ], matrix, this.matrix);

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
        this.matrix = this._multiply([
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0
        ], this.matrix, matrix);

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
}

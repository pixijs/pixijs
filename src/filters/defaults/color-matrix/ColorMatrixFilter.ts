import { Color, type ColorSource } from '../../../color';
import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { deprecation } from '../../../utils';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './colorMatrixFilter.frag';
import source from './colorMatrixFilter.wgsl';

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
 * Options for ColorMatrixFilter
 * @category filters
 * @standard
 */
export interface ColorMatrixFilterOptions extends FilterOptions
{
    /**
     * The opacity value used to blend between the original and transformed colors.
     * @see {@link ColorMatrixFilter.alpha}
     */
    alpha?: number;

    /**
     * The color transformation matrix.
     * @see {@link ColorMatrixFilter.matrix}
     */
    matrix?: ColorMatrix;
}

/**
 * The ColorMatrixFilter class lets you apply color transformations to display objects using a 5x4 matrix.
 * The matrix transforms the RGBA color and alpha values of every pixel to produce a new set of values.
 * @example
 * ```js
 * import { ColorMatrixFilter } from 'pixi.js';
 *
 * // Create a new color matrix filter with a matrix that swap the red channel to the blue and green channel
 * // and the blue channel to the red. Keep alpha.
 * const matrixFilter = new ColorMatrixFilter({
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
     * Default options for the ColorMatrixFilter.
     * @example
     * ```ts
     * ColorMatrixFilter.defaultOptions = {
     *      matrix: [
     *          0.5, 0, 1, 0, 0,
     *          0, 0.5, 1, 0, 0,
     *          0, 0, 0.5, 0, 0,
     *          0, 0, 0, 0.5, 0
     *      ]
     * };
     * // Use default options
     * const filter = new ColorMatrixFilter(); // Uses a copy of the above defined matrix
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
     * const matrixFilter = new ColorMatrixFilter();
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
     * Transforms current matrix and set the new one
     * @param {number[]} matrix - 5x4 matrix
     * @param multiply - if true, current matrix and matrix are multiplied. If false,
     *  just set the current matrix to matrix
     * @private
     */
    protected _loadMatrix(matrix: ColorMatrix, multiply: boolean): void
    {
        if (multiply)
        {
            this.append(matrix);
        }
        else
        {
            this.matrix = matrix;
        }

        this.resources.colorMatrixUniforms.update();
    }

    /**
     * @param b
     * @param multiply
     * @deprecated Use ColorMatrixFilter.brightness instead
     */
    public brightness(b: number, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.brightness has been moved to ColorTransformFilter.brightness');
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
     * @param color
     * @param multiply
     * @deprecated Use ColorMatrixFilter.tint instead
     */
    public tint(color: ColorSource, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.tint has been moved to ColorTransformFilter.tint');
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
     * @param scale
     * @param multiply
     * @deprecated Use ColorMatrixFilter.greyscale instead
     */
    public greyscale(scale: number, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.greyscale has been moved to ColorTransformFilter.greyscale');
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
     * @deprecated
     */
    public grayscale(scale: number, multiply = false): this
    {
        return this.greyscale(scale, multiply);
    }

    /**
     * @param multiply
     * @deprecated Use ColorMatrixFilter.blackAndWhite instead
     */
    public blackAndWhite(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.blackAndWhite has been moved to ColorTransformFilter.blackAndWhite');
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
     * @param rotation
     * @param multiply
     * @deprecated Use ColorMatrixFilter.hue instead
     */
    public hue(rotation: number, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.hue has been moved to ColorTransformFilter.hue');
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
     * @param amount
     * @param multiply
     * @deprecated Use ColorMatrixFilter.contrast instead
     */
    public contrast(amount: number, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.contrast has been moved to ColorTransformFilter.contrast');
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
     * @param amount
     * @param multiply
     * @deprecated Use ColorMatrixFilter.saturate instead
     */
    public saturate(amount = 0, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.saturate has been moved to ColorTransformFilter.saturate');
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
     * @param multiply
     * @deprecated
     */
    public desaturate(multiply = false): this
    {
        return this.saturate(-1, multiply);
    }

    /**
     * @param multiply
     * @deprecated Use ColorMatrixFilter.negative instead
     */
    public negative(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.negative has been moved to ColorTransformFilter.negative');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.sepia instead
     */
    public sepia(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.sepia has been moved to ColorTransformFilter.sepia');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.technicolor instead
     */
    public technicolor(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.technicolor has been moved to ColorTransformFilter.technicolor');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.polaroid instead
     */
    public polaroid(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.polaroid has been moved to ColorTransformFilter.polaroid');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.toBGR instead
     */
    public toBGR(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.toBGR has been moved to ColorTransformFilter.toBGR');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.kodachrome instead
     */
    public kodachrome(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.kodachrome has been moved to ColorTransformFilter.kodachrome');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.browni instead
     */
    public browni(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.browni has been moved to ColorTransformFilter.browni');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.vintage instead
     */
    public vintage(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.vintage has been moved to ColorTransformFilter.vintage');
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
     * @param desaturation
     * @param toned
     * @param lightColor
     * @param darkColor
     * @param multiply
     * @deprecated Use ColorMatrixFilter.this instead
     */
    public colorTone(
        desaturation = 0.2,
        toned = 0.15,
        lightColor: ColorSource = 0xffe580,
        darkColor: ColorSource = 0x338000,
        multiply = false,
    ): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.this has been moved to ColorTransformFilter.this');
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
     * @param intensity
     * @param multiply
     * @deprecated Use ColorMatrixFilter.night instead
     */
    public night(intensity = 0.1, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.night has been moved to ColorTransformFilter.night');
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
     * @param amount
     * @param multiply
     * @deprecated Use ColorMatrixFilter.predator instead
     */
    public predator(amount: number, multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.predator has been moved to ColorTransformFilter.predator');
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
     * @param multiply
     * @deprecated Use ColorMatrixFilter.lsd instead
     */
    public lsd(multiply = false): this
    {
        deprecation('8.18.0', 'ColorMatrixFilter.lsd has been moved to ColorTransformFilter.lsd');
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
     * @deprecated Use ColorTransformFilter.reset
     */
    public reset(): void
    {
        deprecation('8.18.0', 'ColorMatrixFilter.reset has been moved to ColorTransformFilter.reset');
        this.alpha = 1;

        this._loadMatrix([
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ], false);
    }
}

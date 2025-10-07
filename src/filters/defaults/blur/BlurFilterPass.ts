import { TexturePool } from '../../../rendering/renderers/shared/texture/TexturePool';
import { RendererType } from '../../../rendering/renderers/types';
import { deprecation, v8_12_0 } from '../../../utils/logging/deprecation';
import { Filter } from '../../Filter';
import { generateBlurGlProgram } from './gl/generateBlurGlProgram';
import { generateBlurProgram } from './gpu/generateBlurProgram';

import type { RenderSurface } from '../../../rendering/renderers/shared/renderTarget/RenderTargetSystem';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { FilterSystem } from '../../FilterSystem';
import type { BlurFilterOptions } from './BlurFilter';

/**
 * Options for BlurFilterPass
 * @category filters
 * @internal
 */
export interface BlurFilterPassOptions extends BlurFilterOptions
{
    /** Do pass along the x-axis (`true`) or y-axis (`false`). */
    horizontal: boolean;
}

/**
 * The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
 * @category filters
 * @advanced
 * @example
 * import { BlurFilterPass } from 'pixi.js';
 *
 * const filter = new BlurFilterPass({ horizontal: true, strength: 8 });
 * sprite.filters = filter;
 *
 * // update blur
 * filter.blur = 16;
 */
export class BlurFilterPass extends Filter
{
    /** Default blur filter pass options */
    public static defaultOptions: Partial<BlurFilterPassOptions> = {
        /** The strength of the blur filter. */
        strength: 8,
        /** The quality of the blur filter. */
        quality: 4,
        /** The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15. */
        kernelSize: 5,
    };

    /**
     * Make the actual strength of one pass inversely proportional to the square root of the number of passes
     * instead of being inversely proportional to the number of passes.
     * Setting to `false` is the legacy behavior, which is mathematically incorrect
     * but matches the behavior of older versions.
     * It will be true by default in the future.
     */
    public static sqrtScaledStrength = false;

    private static _sqrtScaledStrengthWarningEmitted = false;

    /** Do pass along the x-axis (`true`) or y-axis (`false`). */
    public horizontal: boolean;
    /** The number of passes to run the filter. */
    public passes!: number;
    /** The strength of the blur filter. */
    public strength!: number;

    private _quality: number;
    private readonly _uniforms: any;
    private readonly _kernelSize: number;

    /**
     * @param options
     * @param options.horizontal - Do pass along the x-axis (`true`) or y-axis (`false`).
     * @param options.strength - The strength of the blur filter.
     * @param options.quality - The quality of the blur filter.
     * @param options.kernelSize - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(options: BlurFilterPassOptions)
    {
        if (!BlurFilterPass._sqrtScaledStrengthWarningEmitted && !BlurFilterPass.sqrtScaledStrength)
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation(v8_12_0, 'Set BlurFilterPass.sqrtScaledStrength = true to enable the new mathematically correct behavior of BlurFilterPass.');
            // #endif
            BlurFilterPass._sqrtScaledStrengthWarningEmitted = true;
        }

        options = { ...BlurFilterPass.defaultOptions, ...options };

        const glProgram = generateBlurGlProgram(options.horizontal, options.kernelSize, BlurFilterPass.sqrtScaledStrength);
        const gpuProgram = generateBlurProgram(options.horizontal, options.kernelSize, BlurFilterPass.sqrtScaledStrength);

        super({
            glProgram,
            gpuProgram,
            resources: {
                blurUniforms: {
                    uStrength: { value: 0, type: 'f32' },
                }
            },
            ...options
        });

        this.horizontal = options.horizontal;

        this._quality = 0;

        this.quality = options.quality;

        this.blur = options.strength;

        this._uniforms = this.resources.blurUniforms.uniforms;

        this._kernelSize = options.kernelSize;
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - How to clear
     */
    public apply(
        filterManager: FilterSystem,
        input: Texture,
        output: RenderSurface,
        clearMode: boolean
    ): void
    {
        if (BlurFilterPass.sqrtScaledStrength)
        {
            this._uniforms.uStrength = this.strength / Math.sqrt(this.passes * (this._kernelSize - 1));
        }
        else
        {
            this._uniforms.uStrength = this.strength / this.passes;
        }

        if (this.passes === 1)
        {
            filterManager.applyFilter(this, input, output, clearMode);
        }
        else
        {
            const tempTexture = TexturePool.getSameSizeTexture(input);

            let flip = input;
            let flop = tempTexture;

            this._state.blend = false;

            const shouldClear = filterManager.renderer.type === RendererType.WEBGPU;

            for (let i = 0; i < this.passes - 1; i++)
            {
                filterManager.applyFilter(this, flip, flop, i === 0 ? true : shouldClear);

                const temp = flop;

                flop = flip;
                flip = temp;
            }

            this._state.blend = true;
            filterManager.applyFilter(this, flip, output, clearMode);
            TexturePool.returnTexture(tempTexture);
        }
    }

    /**
     * Sets the strength of both the blur.
     * @default 16
     */
    get blur(): number
    {
        return this.strength;
    }

    set blur(value: number)
    {
        this.padding = 1 + (Math.abs(value) * 2);
        this.strength = value;
    }

    /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher
     * quality blurring but the lower the performance.
     * @default 4
     */
    get quality(): number
    {
        return this._quality;
    }

    set quality(value: number)
    {
        this._quality = value;
        this.passes = value;
    }
}

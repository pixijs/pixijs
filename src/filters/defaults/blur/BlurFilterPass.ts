import { TexturePool } from '../../../rendering/renderers/shared/texture/TexturePool';
import { RendererType } from '../../../rendering/renderers/types';
import { Filter } from '../../Filter';
import { generateBlurGlProgram } from './gl/generateBlurGlProgram';
import { generateBlurProgram } from './gpu/generateBlurProgram';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { RenderSurface } from '../../../rendering/renderers/shared/renderTarget/RenderTargetSystem';
import type { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
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
        /** Whether to use legacy blur pass behavior. */
        legacy: false,
    };

    /** Do pass along the x-axis (`true`) or y-axis (`false`). */
    public horizontal: boolean;
    /** The number of passes to run the filter. */
    public passes!: number;
    /** The strength of the blur filter. */
    public strength!: number;
    /** Whether to use legacy blur pass behavior. */
    public legacy: boolean;

    private _quality: number;
    private readonly _uniforms: any;
    private readonly _blurUniforms: UniformGroup;

    /**
     * @param options
     * @param options.horizontal - Do pass along the x-axis (`true`) or y-axis (`false`).
     * @param options.strength - The strength of the blur filter.
     * @param options.quality - The quality of the blur filter.
     * @param options.kernelSize - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(options: BlurFilterPassOptions)
    {
        options = { ...BlurFilterPass.defaultOptions, ...options };

        const glProgram = generateBlurGlProgram(options.horizontal, options.kernelSize);
        const gpuProgram = generateBlurProgram(options.horizontal, options.kernelSize);

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
        this.legacy = options.legacy ?? false;

        this._quality = 0;

        this.quality = options.quality;

        this.blur = options.strength;

        // Store reference to the UniformGroup before any resource swapping
        this._blurUniforms = this.resources.blurUniforms as UniformGroup;
        this._uniforms = this._blurUniforms.uniforms;
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
        if (this.legacy)
        {
            this._uniforms.uStrength = this.strength / this.passes;
        }
        else
        {
            let sumOfSquares = 1;
            let coefficient = 0.5;

            for (let i = 1; i < this.passes; i++)
            {
                sumOfSquares += coefficient * coefficient;
                coefficient *= 0.5;
            }

            this._uniforms.uStrength = this.strength / Math.sqrt(sumOfSquares);
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

            const renderer = filterManager.renderer;

            const isWebGPU = renderer.type === RendererType.WEBGPU;
            const uboBatcher = (!this.legacy && isWebGPU)
                ? (renderer as WebGPURenderer).renderPipes.uniformBatch
                : null;

            for (let i = 0; i < this.passes - 1; i++)
            {
                // For WebGPU, use the UBO batcher to ensure each pass gets its own uniform values
                // This is needed because writeBuffer executes immediately but draws are batched
                if (uboBatcher)
                {
                    this.groups[1].setResource(uboBatcher.getUboResource(this._blurUniforms), 0);
                }

                const passClear = (this.legacy && i === 0) || isWebGPU;

                filterManager.applyFilter(this, flip, flop, passClear);

                const temp = flop;

                flop = flip;
                flip = temp;

                if (!this.legacy)
                {
                    this._uniforms.uStrength *= 0.5;
                }
            }

            if (uboBatcher)
            {
                this.groups[1].setResource(uboBatcher.getUboResource(this._blurUniforms), 0);
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

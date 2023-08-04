import { Filter } from '../../rendering/filters/shared/Filter';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { generateBlurGlProgram } from './gl/generateBlurGlProgram';
import { generateBlurProgram } from './gpu/generateBlurProgram';

import type { FilterSystem } from '../../rendering/filters/shared/FilterSystem';
import type { RenderSurface } from '../../rendering/renderers/gpu/renderTarget/GpuRenderTargetSystem';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BlurFilterOptions } from './BlurFilter';

export interface BlurFilterPassOptions extends BlurFilterOptions
{
    horizontal: boolean;
}

/**
 * The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
 * @memberof PIXI
 */
export class BlurFilterPass extends Filter
{
    public static defaultOptions: Partial<BlurFilterPassOptions> = {
        strength: 8,
        quality: 4,
        kernelSize: 5,
    };

    public horizontal: boolean;
    public passes!: number;
    public strength!: number;

    private _quality: number;
    private readonly _uniforms: any;

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
                    strength: { value: 0, type: 'f32' },
                }
            },
            ...options
        });

        this.horizontal = options.horizontal;

        this._quality = 0;

        this.quality = options.quality;

        this.blur = options.strength;

        this._uniforms = this.resources.blurUniforms.uniforms;
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
        this._uniforms.strength = this.strength / this.passes;

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

            for (let i = 0; i < this.passes - 1; i++)
            {
                filterManager.applyFilter(this, flip, flop, true);

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
     * quality bluring but the lower the performance.
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

import { Filter } from '@pixi/core';
import { settings } from '@pixi/settings';
import { generateBlurVertSource } from './generateBlurVertSource';
import { generateBlurFragSource } from './generateBlurFragSource';
import { CLEAR_MODES } from '@pixi/constants';

import type { RenderTexture, systems } from '@pixi/core';

/**
 * The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export class BlurFilterPass extends Filter
{
    public horizontal: boolean;
    public strength: number;
    public passes: number;

    private _quality: number;

    /**
     * @param {boolean} horizontal - Do pass along the x-axis (`true`) or y-axis (`false`).
     * @param {number} [strength=8] - The strength of the blur filter.
     * @param {number} [quality=4] - The quality of the blur filter.
     * @param {number} [resolution=1] - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(horizontal: boolean, strength = 8, quality = 4, resolution = settings.RESOLUTION, kernelSize = 5)
    {
        const vertSrc = generateBlurVertSource(kernelSize, horizontal);
        const fragSrc = generateBlurFragSource(kernelSize);

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.horizontal = horizontal;

        this.resolution = resolution;

        this._quality = 0;

        this.quality = quality;

        this.blur = strength;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {PIXI.CLEAR_MODES} clearMode - How to clear
     */
    public apply(
        filterManager: systems.FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES
    ): void
    {
        if (output)
        {
            if (this.horizontal)
            {
                this.uniforms.strength = (1 / output.width) * (output.width / input.width);
            }
            else
            {
                this.uniforms.strength = (1 / output.height) * (output.height / input.height);
            }
        }
        else
        {
            if (this.horizontal) // eslint-disable-line
            {
                this.uniforms.strength = (1 / filterManager.renderer.width) * (filterManager.renderer.width / input.width);
            }
            else
            {
                this.uniforms.strength = (1 / filterManager.renderer.height) * (filterManager.renderer.height / input.height); // eslint-disable-line
            }
        }

        // screen space!
        this.uniforms.strength *= this.strength;
        this.uniforms.strength /= this.passes;

        if (this.passes === 1)
        {
            filterManager.applyFilter(this, input, output, clearMode);
        }
        else
        {
            const renderTarget = filterManager.getFilterTexture();
            const renderer = filterManager.renderer;

            let flip = input;
            let flop = renderTarget;

            this.state.blend = false;
            filterManager.applyFilter(this, flip, flop, CLEAR_MODES.CLEAR);

            for (let i = 1; i < this.passes - 1; i++)
            {
                filterManager.bindAndClear(flip, CLEAR_MODES.BLIT);

                this.uniforms.uSampler = flop;

                const temp = flop;

                flop = flip;
                flip = temp;

                renderer.shader.bind(this);
                renderer.geometry.draw(5);
            }

            this.state.blend = true;
            filterManager.applyFilter(this, flop, output, clearMode);
            filterManager.returnFilterTexture(renderTarget);
        }
    }
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @default 16
     */
    get blur(): number
    {
        return this.strength;
    }

    set blur(value) // eslint-disable-line require-jsdoc
    {
        this.padding = 1 + (Math.abs(value) * 2);
        this.strength = value;
    }

    /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher
     * quaility bluring but the lower the performance.
     *
     * @member {number}
     * @default 4
     */
    get quality(): number
    {
        return this._quality;
    }

    set quality(value) // eslint-disable-line require-jsdoc
    {
        this._quality = value;
        this.passes = value;
    }
}

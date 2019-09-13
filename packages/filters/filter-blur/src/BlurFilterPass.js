import { Filter } from '@pixi/core';
import { settings } from '@pixi/settings';
import { generateBlurVertSource } from './generateBlurVertSource';
import { generateBlurFragSource } from './generateBlurFragSource';

/**
 * The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export class BlurFilterPass extends Filter
{
    /**
     * @param {boolean} horizontal - Do pass along the x-axis (`true`) or y-axis (`false`).
     * @param {number} strength - The strength of the blur filter.
     * @param {number} quality - The quality of the blur filter.
     * @param {number} resolution - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(horizontal, strength, quality, resolution, kernelSize)
    {
        kernelSize = kernelSize || 5;
        const vertSrc = generateBlurVertSource(kernelSize, horizontal);
        const fragSrc = generateBlurFragSource(kernelSize);

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.horizontal = horizontal;

        this.resolution = resolution || settings.RESOLUTION;

        this._quality = 0;

        this.quality = quality || 4;

        this.blur = strength || 8;
    }

    apply(filterManager, input, output, clear)
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
            filterManager.applyFilter(this, input, output, clear);
        }
        else
        {
            const renderTarget = filterManager.getFilterTexture();
            const renderer = filterManager.renderer;

            let flip = input;
            let flop = renderTarget;

            this.state.blend = false;
            filterManager.applyFilter(this, flip, flop, false);

            for (let i = 1; i < this.passes - 1; i++)
            {
                renderer.renderTexture.bind(flip, flip.filterFrame);

                this.uniforms.uSampler = flop;

                const temp = flop;

                flop = flip;
                flip = temp;

                renderer.shader.bind(this);
                renderer.geometry.draw(5);
            }

            this.state.blend = true;
            filterManager.applyFilter(this, flop, output, clear);
            filterManager.returnFilterTexture(renderTarget);
        }
    }
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @default 16
     */
    get blur()
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
    get quality()
    {
        return this._quality;
    }

    set quality(value) // eslint-disable-line require-jsdoc
    {
        this._quality = value;
        this.passes = value;
    }
}

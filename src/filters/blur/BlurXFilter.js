import core from '../../core';
import generateBlurVertSource from './generateBlurVertSource';
import generateBlurFragSource from './generateBlurFragSource';
import getMaxBlurKernelSize from './getMaxBlurKernelSize';

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
class BlurXFilter extends core.Filter
{
    constructor(strength, quality, resolution)
    {
        let vertSrc = generateBlurVertSource(5, true);
        let fragSrc = generateBlurFragSource(5);

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.resolution = resolution || 1;

        this._quality = 0;

        this.quality = quality || 4;
        this.strength = strength || 8;

        this.firstRun = true;

    }

    apply(filterManager, input, output, clear)
    {
        if(this.firstRun)
        {
            let gl = filterManager.renderer.gl;
            let kernelSize = getMaxBlurKernelSize(gl);

            this.vertexSrc = generateBlurVertSource(kernelSize, true);
            this.fragmentSrc = generateBlurFragSource(kernelSize);

            this.firstRun = false;
        }

        this.uniforms.strength = (1/output.size.width) * (output.size.width/input.size.width); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

        // screen space!
        this.uniforms.strength *= this.strength;
        this.uniforms.strength /= this.passes;// / this.passes//Math.pow(1, this.passes);

        if(this.passes === 1)
        {
            filterManager.applyFilter(this, input, output, clear);
        }
        else
        {
            let renderTarget = filterManager.getRenderTarget(true);
            let flip = input;
            let flop = renderTarget;

            for(let i = 0; i < this.passes-1; i++)
            {
                filterManager.applyFilter(this, flip, flop, true);

               let temp = flop;
               flop = flip;
               flip = temp;
            }

            filterManager.applyFilter(this, flip, output, clear);

            filterManager.returnRenderTarget(renderTarget);
        }
    }

    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 16
     */
    get blur()
    {
        return  this.strength;
    }
    set blur(value)
    {
        this.padding =  Math.abs(value) * 2;
        this.strength = value;
    }
    
     /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher quaility bluring but the lower the performance.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 4
     */
    get quality()
    {
        return  this._quality;
    }
    set quality(value)
    {
        this._quality = value;
        this.passes = value;
    }
}

export default BlurXFilter;
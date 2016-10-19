import * as core from '../../core';
const glslify = require('glslify'); // eslint-disable-line no-undef

/**
 * The DisplacementFilter class uses the pixel values from the specified texture
 * (called the displacement map) to perform a displacement of an object. You can
 * use this filter to apply all manor of crazy warping effects. Currently the r
 * property of the texture is used to offset the x and the g property of the texture
 * is used to offset the y.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export default class DisplacementFilter extends core.Filter
{
    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param {number} scale - The scale of the displacement
     */
    constructor(sprite, scale)
    {
        const maskMatrix = new core.Matrix();

        sprite.renderable = false;

        super(
            // vertex shader
            glslify('../fragments/default-filter-matrix.vert'),
            // fragment shader
            glslify('./displacement.frag')
        );

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;

        this.uniforms.mapSampler = sprite.texture;
        this.uniforms.filterMatrix = maskMatrix.toArray(true);
        this.uniforms.scale = { x: 1, y: 1 };

        if (scale === null || scale === undefined)
        {
            scale = 20;
        }

        this.scale = new core.Point(scale, scale);
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.FilterManager} filterManager - The manager.
     * @param {PIXI.RenderTarget} input - The input target.
     * @param {PIXI.RenderTarget} output - The output target.
     */
    apply(filterManager, input, output)
    {
        const ratio =  (1 / output.destinationFrame.width) * (output.size.width / input.size.width);

        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
        this.uniforms.scale.x = this.scale.x * ratio;
        this.uniforms.scale.y = this.scale.y * ratio;

         // draw the filter...
        filterManager.applyFilter(this, input, output);
    }

    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.filters.DisplacementFilter#
     */
    get map()
    {
        return this.uniforms.mapSampler;
    }

    /**
     * Sets the texture to use for the displacement.
     *
     * @param {PIXI.Texture} value - The texture to set to.
     */
    set map(value)
    {
        this.uniforms.mapSampler = value;
    }
}

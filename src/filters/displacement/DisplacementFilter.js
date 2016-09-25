import core from '../../core';
const glslify = require('glslify');

/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param sprite {PIXI.Sprite} The sprite used for the displacement map. (make sure its added to the scene!)
 * @param scale {number} The scale of the displacement
 */
class DisplacementFilter extends core.Filter
{
    constructor(sprite, scale)
    {
        const maskMatrix = new core.Matrix();
        sprite.renderable = false;

        super(
            // vertex shader
    //        glslify('./displacement.vert'),
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

    apply(filterManager, input, output)
    {
        const ratio =  (1/output.destinationFrame.width) * (output.size.width/input.size.width); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

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
    set map(value)
    {
        this.uniforms.mapSampler = value;
    }
}

export default DisplacementFilter;

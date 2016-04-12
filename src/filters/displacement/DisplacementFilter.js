var core = require('../../core');
var glslify  = require('glslify');

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
function DisplacementFilter(sprite, scale)
{
    var maskMatrix = new core.Matrix();
    sprite.renderable = false;

    core.Filter.call(this,
        // vertex shader
        glslify('./displacement.vert'),
        // fragment shader
        glslify('./displacement.frag')

    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    this.uniforms.mapSampler = sprite.texture;
    this.uniforms.otherMatrix = maskMatrix.toArray(true);
    this.uniforms.scale = { x: 1, y: 1 };

    if (scale === null || scale === undefined)
    {
        scale = 20;
    }

    this.scale = new core.Point(scale, scale);
}

DisplacementFilter.prototype = Object.create(core.Filter.prototype);
DisplacementFilter.prototype.constructor = DisplacementFilter;
module.exports = DisplacementFilter;

DisplacementFilter.prototype.apply = function (filterManager, input, output)
{
    var ratio =  (1/output.destinationFrame.width) * (output.size.width/input.size.width); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
    this.uniforms.scale.x = this.scale.x * ratio;
    this.uniforms.scale.y = this.scale.y * ratio;

     // draw the filter...
    filterManager.applyFilter(this, input, output);
};


Object.defineProperties(DisplacementFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.filters.DisplacementFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.mapSampler;
        },
        set: function (value)
        {
            this.uniforms.mapSampler = value;

        }
    }
});

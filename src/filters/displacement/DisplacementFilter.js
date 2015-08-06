var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 * @param sprite {PIXI.Sprite} the sprite used for the displacement map. (make sure its added to the scene!)
 */
function DisplacementFilter(sprite, scale)
{
    var maskMatrix = new core.Matrix();
    sprite.renderable = false;

    core.AbstractFilter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/displacement.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + '/displacement.frag', 'utf8'),
        // uniforms
        {
            mapSampler:     { type: 'sampler2D', value: sprite.texture },
            otherMatrix:    { type: 'mat3', value: maskMatrix.toArray(true) },
            scale:          { type: 'v2', value: { x: 1, y: 1 } }
        }
    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    if (scale === null || scale === undefined)
    {
        scale = 20;
    }

    this.scale = new core.Point(scale, scale);
}

DisplacementFilter.prototype = Object.create(core.AbstractFilter.prototype);
DisplacementFilter.prototype.constructor = DisplacementFilter;
module.exports = DisplacementFilter;

DisplacementFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);

    this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
    this.uniforms.scale.value.x = this.scale.x * (1/input.frame.width);
    this.uniforms.scale.value.y = this.scale.y * (1/input.frame.height);

    var shader = this.getShader(renderer);
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
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
            return this.uniforms.mapSampler.value;
        },
        set: function (value)
        {
            this.uniforms.mapSampler.value = value;

        }
    }
});

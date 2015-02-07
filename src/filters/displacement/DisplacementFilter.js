'use strict';
var core = require('../../core');

/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI.filters
 * @param texture {Texture} The texture used for the displacement map, must be power of 2 texture at the moment
 */
function DisplacementFilter(texture)
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        require('fs').readFileSync(__dirname + '/displacement.frag', 'utf8'),
        // custom uniforms
        {
            displacementMap: { type: 'sampler2D', value: texture },
            scale:           { type: 'v2',  value: { x: 30, y: 30 } },
            offset:          { type: 'v2',  value: { x: 0,  y: 0 } },
            mapDimensions:   { type: 'v2',  value: { x: 1,  y: 5112 } },
            dimensions:      { type: '4fv', value: [0, 0, 0, 0] }
        }
    );

    texture.baseTexture._powerOf2 = true;

    if (texture.baseTexture.hasLoaded)
    {
        this.onTextureLoaded();
    }
    else
    {
        texture.baseTexture.once('loaded', this.onTextureLoaded.bind(this));
    }
}

DisplacementFilter.prototype = Object.create(core.AbstractFilter.prototype);
DisplacementFilter.prototype.constructor = DisplacementFilter;
module.exports = DisplacementFilter;

/**
 * Sets the map dimensions uniforms when the texture becomes available.
 *
 * @private
 */
DisplacementFilter.prototype.onTextureLoaded = function ()
{
    this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
    this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
};

Object.defineProperties(DisplacementFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 texture.
     *
     * @member {Texture}
     * @memberof DisplacementFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.displacementMap.value;
        },
        set: function (value)
        {
            this.uniforms.displacementMap.value = value;
        }
    },

    /**
     * The multiplier used to scale the displacement result from the map calculation.
     *
     * @member {Point}
     * @memberof DisplacementFilter#
     */
    scale: {
        get: function ()
        {
            return this.uniforms.scale.value;
        },
        set: function (value)
        {
            this.uniforms.scale.value = value;
        }
    },

    /**
     * The offset used to move the displacement map.
     *
     * @member {Point}
     * @memberof DisplacementFilter#
     */
    offset: {
        get: function ()
        {
            return this.uniforms.offset.value;
        },
        set: function (value)
        {
            this.uniforms.offset.value = value;
        }
    }
});

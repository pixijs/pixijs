var AbstractFilter = require('./AbstractFilter');

/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 * @param texture {Texture} The texture used for the displacement map * must be power of 2 texture at the moment
 */
function DisplacementFilter(texture)
{
    AbstractFilter.call(this);

    texture.baseTexture._powerOf2 = true;

    // set the uniforms
    this.uniforms = {
        displacementMap: { type: 'sampler2D', value: texture },
        scale:           { type: '2f',  value: { x: 30, y: 30 } },
        offset:          { type: '2f',  value: { x: 0,  y: 0 } },
        mapDimensions:   { type: '2f',  value: { x: 1,  y: 5112 } },
        dimensions:      { type: '4fv', value: [0, 0, 0, 0] }
    };

    if (texture.baseTexture.hasLoaded)
    {
        this.onTextureLoaded();
    }
    else
    {
        this.boundLoadedFunction = this.onTextureLoaded.bind(this);

        texture.baseTexture.on('loaded', this.boundLoadedFunction);
    }

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform sampler2D displacementMap;',
        'uniform sampler2D uSampler;',
        'uniform vec2 scale;',
        'uniform vec2 offset;',
        'uniform vec4 dimensions;',
        'uniform vec2 mapDimensions;',// = vec2(256.0, 256.0);',
        // 'const vec2 textureDimensions = vec2(750.0, 750.0);',

        'void main(void)
        {',
        '   vec2 mapCords = vTextureCoord.xy;',
        '   mapCords += (dimensions.zw + offset)/ dimensions.xy ;',
        '   mapCords.y *= -1.0;',
        '   mapCords.y += 1.0;',

        '   vec2 matSample = texture2D(displacementMap, mapCords).xy;',
        '   matSample -= 0.5;',
        '   matSample *= scale;',
        '   matSample /= mapDimensions;',

        '   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));',

        //TODO: Is this needed?
        '   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);',
        '}'
    ];
}

DisplacementFilter.prototype = Object.create(AbstractFilter.prototype);
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

    this.uniforms.displacementMap.value.baseTexture.off('loaded', this.boundLoadedFunction);
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

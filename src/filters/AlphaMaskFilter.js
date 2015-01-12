var AbstractFilter = require('./AbstractFilter');

/**
 * The AlphaMaskFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 * @param texture {Texture} The texture used for the displacement map * must be power of 2 texture at the moment
 */
function AlphaMaskFilter(texture)
{
    AbstractFilter.call(this);

    texture.baseTexture._powerOf2 = true;

    // set the uniforms
    this.uniforms = {
        mask:           { type: 'sampler2D',    value: texture },
        mapDimensions:  { type: '2f',           value: { x: 1, y: 5112 } },
        dimensions:     { type: '4fv',          value: [0, 0, 0, 0] },
        offset:         { type: '2f',           value: { x: 0, y: 0 } }
    };

    if (texture.baseTexture.hasLoaded)
    {
        this.uniforms.mask.value.x = texture.width;
        this.uniforms.mask.value.y = texture.height;
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

        'uniform sampler2D uSampler;',
        'uniform sampler2D mask;',
        'uniform vec2 mapDimensions;',
        'uniform vec4 dimensions;',
        'uniform vec2 offset;',

        'void main()
        {',
        '   vec2 mapCords = vTextureCoord.xy;',
        '   mapCords += (dimensions.zw + offset)/ dimensions.xy ;',
        '   mapCords.y *= -1.0;',
        '   mapCords.y += 1.0;',
        '   mapCords *= dimensions.xy / mapDimensions;',

        '   vec4 original =  texture2D(uSampler, vTextureCoord);',
        '   float maskAlpha =  texture2D(mask, mapCords).r;',
        '   original *= maskAlpha;',
        //'   original.rgb *= maskAlpha;',
        '   gl_FragColor =  original;',
        //'   gl_FragColor = gl_FragColor;',
        '}'
    ];
}

AlphaMaskFilter.prototype = Object.create(AbstractFilter.prototype);
AlphaMaskFilter.prototype.constructor = AlphaMaskFilter;
module.exports = AlphaMaskFilter;

/**
 * Sets the map dimensions uniforms when the texture becomes available.
 *
 */
AlphaMaskFilter.prototype.onTextureLoaded = function ()
{
    this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width;
    this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height;

    this.uniforms.mask.value.baseTexture.off('loaded', this.boundLoadedFunction);
};

Object.defineProperties(AlphaMaskFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {Texture}
     * @memberof AlphaMaskFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.mask.value;
        },
        set: function (value)
        {
            this.uniforms.mask.value = value;
        }
    },

    /**
     * The offset used to move the displacement map.
     *
     * @member {Point}
     * @memberof AlphaMaskFilter#
     */
    offset: {
        get: function()
        {
            return this.uniforms.offset.value;
        },
        set: function(value)
        {
            this.uniforms.offset.value = value;
        }
    }
});

var core = require('../../core');

/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 * @param texture {Texture} The texture used for the displacement map * must be power of 2 texture at the moment
 */
function DisplacementFilter(sprite)
{
    var maskMatrix = new core.math.Matrix();
    sprite.renderable = false;

    //TODO move this code out to a frag and vert file.
    core.AbstractFilter.call(this,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'attribute vec4 aColor;',

            'uniform mat3 projectionMatrix;',
            'uniform mat3 otherMatrix;',

            'varying vec2 vMapCoord;',
            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',

            'void main(void)',
            '{',
            '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
            '   vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
            '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'precision lowp float;',

            'varying vec2 vMapCoord;',
            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',

            'uniform vec2 scale;',

            'uniform sampler2D uSampler;',
            'uniform sampler2D mapSampler;',

            'void main(void)',
            '{',
            '   vec4 original =  texture2D(uSampler, vTextureCoord);',
            '   vec4 map =  texture2D(mapSampler, vMapCoord);',
             '  map -= 0.5;',
            '   map.xy *= scale;',
            '   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y));',
            '}'
        ].join('\n'),
        // uniforms
        {
            mapSampler:     { type: 'sampler2D', value: sprite.texture },
            otherMatrix:    { type: 'mat3', value: maskMatrix.toArray(true) },
            scale:          { type: 'v2', value: { x: 1, y: 1 } }
        }
    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;


    this.scale = new PIXI.Point(20,20);

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
     * @member {Texture}
     * @memberof DisplacementFilter#
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

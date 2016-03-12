var AbstractFilter = require('../../../core/renderers/webgl/filters/AbstractFilter');
var Sprite3dShader = require('../Sprite3dShader');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 *
 * Basic FXAA implementation based on the code on geeks3d.com with the
 * modification that the texture2DLod stuff was removed since it's
 * unsupported by WebGL.
 *
 * --
 * From:
 * https://github.com/mitsuhiko/webgl-meincraft
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI
 *
 */
function FXAAFilter()
{
    AbstractFilter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/FXAA.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + './../../../core/renderers/webgl/filters/FXAA.frag', 'utf8'),
        // uniforms
        {
            resolution: { type: 'v2', value: { x: 1, y: 1 } }
        }
    );

}

FXAAFilter.prototype = Object.create(AbstractFilter.prototype);
FXAAFilter.prototype.constructor = FXAAFilter;
module.exports = FXAAFilter;

/**
 * Applies the filter
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer to retrieve the filter from
 * @param input {PIXI.RenderTarget}
 * @param output {PIXI.RenderTarget}
 */
FXAAFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    var shader = this.getShader( renderer );
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};

FXAAFilter.prototype.getShader = function (renderer)
{
    var gl = renderer.gl;

    var shader = this.shaders[gl.id];

    if (!shader)
    {
        shader = new Sprite3dShader(renderer.shaderManager,
            this.vertexSrc,
            this.fragmentSrc,
            this.uniforms,
            this.attributes
        );

        this.shaders[gl.id] = shader;
    }

    return shader;
};

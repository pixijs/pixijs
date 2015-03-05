var AbstractFilter = require('./AbstractFilter');

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
 * @extends AbstractFilter
 * @memberof PIXI
 *
 */
function FXAAFilter()
{
    var fs = require('fs');

    AbstractFilter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/FXAA.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + '/FXAA.frag', 'utf8'),
        // uniforms
        {
            resolution: { type: 'v2', value: { x: 1, y: 1 } }
        }
    );

}

FXAAFilter.prototype = Object.create(AbstractFilter.prototype);
FXAAFilter.prototype.constructor = FXAAFilter;
module.exports = FXAAFilter;

FXAAFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    var shader = this.getShader( renderer );
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};

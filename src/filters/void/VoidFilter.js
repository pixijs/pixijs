var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var glslify  = require('glslify');

/**
 * Does nothing. Very handy.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function VoidFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('./void.vert', 'utf8'),
        // fragment shader
        glslify('./void.frag', 'utf8')
    );

    this.glShaderKey = 'void';
}

VoidFilter.prototype = Object.create(core.Filter.prototype);
VoidFilter.prototype.constructor = VoidFilter;
module.exports = VoidFilter;

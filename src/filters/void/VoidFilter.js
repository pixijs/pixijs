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
class VoidFilter extends core.Filter {
    constructor()
    {
        super(
            // vertex shader
            glslify('../fragments/default.vert'),
            // fragment shader
            glslify('./void.frag')
        );

        this.glShaderKey = 'void';
    }
}

module.exports = VoidFilter;

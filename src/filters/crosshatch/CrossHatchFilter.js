var core = require('../../core');
var glslify  = require('glslify');

/**
 * A Cross Hatch effect filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function CrossHatchFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./crosshatch.frag')
    );
}

CrossHatchFilter.prototype = Object.create(core.Filter.prototype);
CrossHatchFilter.prototype.constructor = CrossHatchFilter;
module.exports = CrossHatchFilter;

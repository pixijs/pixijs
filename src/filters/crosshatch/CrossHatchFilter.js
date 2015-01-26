var core = require('../../core'),
    blurFactor = 1 / 7000;

/**
 * A Cross Hatch effect filter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI.filters
 */
function CrossHatchFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        require('fs').readFileSync(__dirname + '/crosshatch.frag', 'utf8')
    );
}

CrossHatchFilter.prototype = Object.create(core.AbstractFilter.prototype);
CrossHatchFilter.prototype.constructor = CrossHatchFilter;
module.exports = CrossHatchFilter;

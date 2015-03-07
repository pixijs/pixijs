var core = require('../../core');
var fs = require('fs');

/**
 * A Cross Hatch effect filter.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function CrossHatchFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fs.readFileSync(__dirname + '/crosshatch.frag', 'utf8')
    );
}

CrossHatchFilter.prototype = Object.create(core.AbstractFilter.prototype);
CrossHatchFilter.prototype.constructor = CrossHatchFilter;
module.exports = CrossHatchFilter;

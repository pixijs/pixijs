var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * A Cross Hatch effect filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
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

module.exports = core.AbstractFilter.extend(CrossHatchFilter);

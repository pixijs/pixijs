var core = require('../../core');
var fs = require('fs');

/**
 * A Smart Blur Filter.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function SmartBlurFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fs.readFileSync(__dirname + '/smartBlur.frag', 'utf8')
    );
}

SmartBlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
SmartBlurFilter.prototype.constructor = SmartBlurFilter;
module.exports = SmartBlurFilter;

var TiltShiftAxisFilter = require('./TiltShiftAxisFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftYFilter.
 *
 * @class
 * @extends PIXI.TiltShiftAxisFilter
 * @memberof PIXI.filters
 */
function TiltShiftYFilter()
{
    TiltShiftAxisFilter.call(this);
}

TiltShiftYFilter.prototype = Object.create(TiltShiftAxisFilter.prototype);
TiltShiftYFilter.prototype.constructor = TiltShiftYFilter;
module.exports = TiltShiftYFilter;

/**
 * Updates the filter delta values.
 *
 */
TiltShiftYFilter.prototype.updateDelta = function ()
{
    var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
    var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
    var d = Math.sqrt(dx * dx + dy * dy);

    this.uniforms.delta.value.x = -dy / d;
    this.uniforms.delta.value.y = dx / d;
};

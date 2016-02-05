var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function TwistFilter()
{
    core.Filter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/twist.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + '/twist.frag', 'utf8')
        // custom uniforms
    );

    this.uniforms.radius = 400; 
    this.uniforms.angle = 3; 
    this.uniforms.offset = [400,300]; 
    //this.uniforms.dimensions = [100, 100, 100, 100];
    this.transform = new core.math.Matrix();
    this.padding = 200;
}

TwistFilter.prototype = Object.create(core.Filter.prototype);
TwistFilter.prototype.constructor = TwistFilter;
module.exports = TwistFilter;

TwistFilter.prototype.apply = function (filterManager, input, output, clear)
{
    var maskSprite = this.maskSprite;

    var currentState = filterManager.stack[filterManager.stackIndex];
    /*
    this.uniforms.filterArea[0] = input.size.width;
    this.uniforms.filterArea[1] = input.size.height;
    this.uniforms.filterArea[2] = currentState.sourceFrame.x;
    this.uniforms.filterArea[3] = currentState.sourceFrame.y;
    */

    filterManager.applyFilter(this, input, output, clear);
};

Object.defineProperties(TwistFilter.prototype, {
    /**
     * This point describes the the offset of the twist.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TwistFilter#
     */
    offset: {
        get: function ()
        {
            return this.uniforms.offset;
        },
        set: function (value)
        {
            this.uniforms.offset = value;
        }
    },

    /**
     * This radius of the twist.
     *
     * @member {number}
     * @memberof PIXI.filters.TwistFilter#
     */
    radius: {
        get: function ()
        {
            return this.uniforms.radius;
        },
        set: function (value)
        {
            this.uniforms.radius = value;
        }
    },

    /**
     * This angle of the twist.
     *
     * @member {number}
     * @memberof PIXI.filters.TwistFilter#
     */
    angle: {
        get: function ()
        {
            return this.uniforms.angle;
        },
        set: function (value)
        {
            this.uniforms.angle = value;
        }
    }
});

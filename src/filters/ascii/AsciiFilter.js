var core = require('../../core');

/**
 * @author Vico @vicocotea
 * original shader : https://www.shadertoy.com/view/lssGDj by @movAX13h
 */

/**
 * An ASCII filter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function AsciiFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        require('fs').readFileSync(__dirname + '/ascii.frag', 'utf8'),
        // custom uniforms
        {
            dimensions: { type: '4fv', value: new Float32Array([10000, 100, 10, 10]) },
            pixelSize:  { type: '1f', value: 8}
        }
    );
}

AsciiFilter.prototype = Object.create(core.AbstractFilter.prototype);
AsciiFilter.prototype.constructor = AsciiFilter;
module.exports = AsciiFilter;

Object.defineProperties(AsciiFilter.prototype, {
    /**
     * The pixel size used by the filter.
     *
     * @member {number}
     * @memberof AsciiFilter#
     */
    size: {
        get: function ()
        {
            return this.uniforms.pixelSize.value;
        },
        set: function (value)
        {
            this.uniforms.pixelSize.value = value;
        }
    }
});

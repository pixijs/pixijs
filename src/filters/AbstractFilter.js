/**
 * This is the base class for creating a PIXI filter. Currently only WebGL supports filters.
 * If you want to make a custom filter this should be your base class.
 *
 * @class
 * @namespace PIXI
 * @param fragmentSrc {string|string[]} The fragment source in an array of strings.
 * @param uniforms {object} An object containing the uniforms for this filter.
 */
function AbstractFilter(fragmentSrc, uniforms) {
    /**
     * An array of passes - some filters contain a few steps this array simply stores the steps in a liniear fashion.
     * For example the blur filter has two passes blurX and blurY.
     *
     * @member {AbstractFilter[]}
     * @private
     */
    this.passes = [this];

    /**
     * @member {Shader[]}
     * @private
     */
    this.shaders = [];

    /**
     * @member {number}
     */
    this.padding = 0;

    /**
     * @member {object}
     * @private
     */
    this.uniforms = uniforms || {};

    /**
     * @member {string[]}
     * @private
     */
    this.fragmentSrc = typeof fragmentSrc === 'string' ? fragmentSrc.split('') : (fragmentSrc || []);
}

AbstractFilter.prototype.constructor = AbstractFilter;
module.exports = AbstractFilter;

/**
 * Syncs the uniforms between the class object and the shaders.
 *
 */
AbstractFilter.prototype.syncUniforms = function () {
    for (var i = 0, j = this.shaders.length; i < j; ++i) {
        this.shaders[i].dirty = true;
    }
};

/*
AbstractFilter.prototype.apply = function (frameBuffer) {
    // TODO :)
};
*/

var GLShader = require('pixi-gl-core').GLShader;
var Const = require('./const');

function checkPrecision(src) {
    if (src instanceof Array) {
        if (src[0].substring(0,9) !== 'precision') {
            var copy = src.slice(0);
            copy.unshift('precision ' + Const.PRECISION.DEFAULT + ' float;');
            return copy;
        }
    } else {
        if (src.substring(0,9) !== 'precision') {
            return 'precision ' + Const.PRECISION.DEFAULT + ' float;\n' + src;
        }
    }
    return src;
}

/**
 * Wrapper class, webGL Shader for Pixi.
 * Adds precision string if vertexSrc or fragmentSrc have no mention of it.
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 * @param attributeLocations {Object} An attribute location map that lets you manually set the attribute locations.
 */
var Shader = function(gl, vertexSrc, fragmentSrc, attributeLocations) {
    GLShader.call(this, gl, checkPrecision(vertexSrc), checkPrecision(fragmentSrc), attributeLocations);
};

Shader.prototype = Object.create(GLShader.prototype);
Shader.prototype.constructor = Shader;
module.exports = Shader;

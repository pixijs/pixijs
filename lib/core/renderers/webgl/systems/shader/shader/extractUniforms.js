'use strict';

exports.__esModule = true;
exports.default = extractUniforms;

var _mapType = require('./mapType');

var _mapType2 = _interopRequireDefault(_mapType);

var _defaultValue = require('./defaultValue');

var _defaultValue2 = _interopRequireDefault(_defaultValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Extracts the uniforms
 * @class
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param program {WebGLProgram} The shader program to get the uniforms from
 * @return uniforms {Object}
 */
function extractUniforms(gl, program) {
    var uniforms = {};

    var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (var i = 0; i < totalUniforms; i++) {
        var uniformData = gl.getActiveUniform(program, i);
        var name = uniformData.name.replace(/\[.*?\]/, '');
        var type = (0, _mapType2.default)(gl, uniformData.type);

        uniforms[name] = {
            type: type,
            size: uniformData.size,
            location: gl.getUniformLocation(program, name),
            value: (0, _defaultValue2.default)(type, uniformData.size)
        };
    }

    return uniforms;
}
//# sourceMappingURL=extractUniforms.js.map
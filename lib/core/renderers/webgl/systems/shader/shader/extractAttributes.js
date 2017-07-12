'use strict';

exports.__esModule = true;
exports.default = extractAttributes;

var _mapType = require('./mapType');

var _mapType2 = _interopRequireDefault(_mapType);

var _mapSize = require('./mapSize');

var _mapSize2 = _interopRequireDefault(_mapSize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Extracts the attributes
 * @class
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param program {WebGLProgram} The shader program to get the attributes from
 * @return attributes {Object}
 */
function extractAttributes(gl, program) {
    var attributes = {};

    var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (var i = 0; i < totalAttributes; i++) {
        var attribData = gl.getActiveAttrib(program, i);
        var type = (0, _mapType2.default)(gl, attribData.type);

        attributes[attribData.name] = {
            type: type,
            size: (0, _mapSize2.default)(type),
            location: gl.getAttribLocation(program, attribData.name),
            // TODO - make an attribute object
            pointer: pointer
        };
    }

    return attributes;
}

function pointer() // type, normalized, stride, start)
{
    // gl.vertexAttribPointer(this.location, this.size, type || gl.FLOAT, normalized || false, stride || 0, start || 0);
}
//# sourceMappingURL=extractAttributes.js.map
'use strict';

exports.__esModule = true;
exports.default = getTestContext;

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var context = null;

/**
 * returns a little webGL context to use for program inspection.
 *
 * @static
 * @private
 * @returns {webGL-context} a gl context to test with
 */

function getTestContext() {
    if (!context) {
        var canvas = document.createElement('canvas');

        var gl = void 0;

        if (_settings2.default.PREFER_WEBGL_2) {
            gl = canvas.getContext('webgl2', {});
        }

        if (!gl) {
            gl = canvas.getContext('webgl', {}) || canvas.getContext('experimental-webgl', {});

            if (!gl) {
                // fail, not able to get a context
                throw new Error('This browser does not support webGL. Try using the canvas renderer');
            } else {
                // for shader testing..
                gl.getExtension('WEBGL_draw_buffers');
            }
        }

        context = gl;

        return gl;
    }

    return context;
}
//# sourceMappingURL=getTestContext.js.map
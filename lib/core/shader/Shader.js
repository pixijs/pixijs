'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Program = require('./Program');

var _Program2 = _interopRequireDefault(_Program);

var _UniformGroup = require('./UniformGroup');

var _UniformGroup2 = _interopRequireDefault(_UniformGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
var Shader = function () {
    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    function Shader(program, uniforms) {
        _classCallCheck(this, Shader);

        this.program = program;

        // lets see whats been passed in
        // uniforms should be converted to a uniform group
        if (uniforms) {
            if (uniforms instanceof _UniformGroup2.default) {
                this.uniformGroup = uniforms;
            } else {
                this.uniformGroup = new _UniformGroup2.default(uniforms);
            }
        } else {
            this.uniformGroup = new _UniformGroup2.default({});
        }

        // time to build some getters and setters!
        // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
        // does the trick for now though!
        for (var i in program.uniformData) {
            if (this.uniformGroup.uniforms[i] instanceof Array) {
                this.uniformGroup.uniforms[i] = new Float32Array(this.uniformGroup.uniforms[i]);
            }
        }
    }

    // TODO move to shader system..


    Shader.prototype.checkUniformExists = function checkUniformExists(name, group) {
        if (group.uniforms[name]) {
            return true;
        }

        for (var i in group.uniforms) {
            var uniform = group.uniforms[i];

            if (uniform.group) {
                if (this.checkUniformExists(name, uniform)) {
                    return true;
                }
            }
        }

        return false;
    };

    Shader.prototype.destroy = function destroy() {
        // usage count on programs?
        // remove if not used!
        this.uniformGroup = null;
    };

    /**
     * A short hand function to create a shader based of a vertex and fragment shader
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     *
     * @returns {PIXI.Shader} an shiney new pixi shader.
     */
    Shader.from = function from(vertexSrc, fragmentSrc, uniforms) {
        var program = _Program2.default.from(vertexSrc, fragmentSrc);

        return new Shader(program, uniforms);
    };

    _createClass(Shader, [{
        key: 'uniforms',
        get: function get() {
            return this.uniformGroup.uniforms;
        }
    }]);

    return Shader;
}();

exports.default = Shader;
//# sourceMappingURL=Shader.js.map
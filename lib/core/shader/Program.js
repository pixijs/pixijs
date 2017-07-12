'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extractUniformsFromSrc = require('./extractUniformsFromSrc');

var _extractUniformsFromSrc2 = _interopRequireDefault(_extractUniformsFromSrc);

var _shader = require('../renderers/webgl/systems/shader/shader');

var shaderUtils = _interopRequireWildcard(_shader);

var _utils = require('../utils');

var _getTestContext = require('../utils/getTestContext');

var _getTestContext2 = _interopRequireDefault(_getTestContext);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UID = 0;

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */

var Program = function () {
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     */
    function Program(vertexSrc, fragmentSrc) {
        _classCallCheck(this, Program);

        /**
         * The vertex shader.
         *
         * @member {string}
         */
        this.vertexSrc = vertexSrc || Program.defaultVertexSrc;

        /**
         * The fragment shader.
         *
         * @member {string}
         */
        this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

        // currently this does not extract structs only default types
        this.extractData(this.vertexSrc, this.fragmentSrc);

        // this is where we store shader references..
        this.glShaders = {};

        this.syncUniforms = null;

        this.id = UID++;
    }

    /**
     * Extracts the data for a buy creating a small test program
     * or reading the src directly.
     * @private
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     */


    Program.prototype.extractData = function extractData(vertexSrc, fragmentSrc) {
        var gl = (0, _getTestContext2.default)();

        if (!gl) {
            // uh oh! no webGL.. lets read uniforms from the strings..
            this.attributeData = {};
            this.uniformData = (0, _extractUniformsFromSrc2.default)(vertexSrc, fragmentSrc);
        } else {
            vertexSrc = shaderUtils.setPrecision(vertexSrc, 'mediump');
            fragmentSrc = shaderUtils.setPrecision(fragmentSrc, 'mediump');

            var program = shaderUtils.compileProgram(gl, vertexSrc, fragmentSrc);

            this.attributeData = this.getAttributeData(program, gl);
            this.uniformData = this.getUniformData(program, gl);
            // gl.deleteProgram(program);
        }
    };

    /**
     * returns the attribute data from the program
     * @private
     *
     * @param {webGL-program} [program] - the webgl program
     * @param {contex} [gl] - the webGL context
     *
     * @returns {object} the attribute data for this program
     */


    Program.prototype.getAttributeData = function getAttributeData(program, gl) {
        var attributes = {};
        var attributesArray = [];

        var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (var i = 0; i < totalAttributes; i++) {
            var attribData = gl.getActiveAttrib(program, i);
            var type = shaderUtils.mapType(gl, attribData.type);

            /*eslint-disable */
            var data = {
                type: type,
                name: attribData.name,
                size: shaderUtils.mapSize(type),
                location: 0
            };
            /*eslint-enable */

            attributes[attribData.name] = data;
            attributesArray.push(data);
        }

        attributesArray.sort(function (a, b) {
            return a.name > b.name ? 1 : -1;
        }); // eslint-disable-line no-confusing-arrow

        for (var _i = 0; _i < attributesArray.length; _i++) {
            attributesArray[_i].location = _i;
        }

        return attributes;
    };

    /**
     * returns the uniform data from the program
     * @private
     *
     * @param {webGL-program} [program] - the webgl program
     * @param {contex} [gl] - the webGL context
     *
     * @returns {object} the uniform data for this program
     */


    Program.prototype.getUniformData = function getUniformData(program, gl) {
        var uniforms = {};

        var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        // TODO expose this as a prop?
        // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');
        // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

        for (var i = 0; i < totalUniforms; i++) {
            var uniformData = gl.getActiveUniform(program, i);
            var name = uniformData.name.replace(/\[.*?\]/, '');

            var isArray = uniformData.name.match(/\[.*?\]/, '');
            var type = shaderUtils.mapType(gl, uniformData.type);

            /*eslint-disable */
            uniforms[name] = {
                type: type,
                size: uniformData.size,
                isArray: isArray,
                value: shaderUtils.defaultValue(type, uniformData.size)
            };
            /*eslint-enable */
        }

        return uniforms;
    };

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     */


    /**
     * A short hand function to create a program based of a vertex and fragment shader
     * this method will also check to see if there is a cached program.
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     *
     * @returns {PIXI.Shader} an shiney new pixi shader.
     */
    Program.from = function from(vertexSrc, fragmentSrc) {
        var key = vertexSrc + fragmentSrc;

        var program = _utils.ProgramCache[key];

        if (!program) {
            _utils.ProgramCache[key] = program = new Program(vertexSrc, fragmentSrc);
        }

        return program;
    };

    _createClass(Program, null, [{
        key: 'defaultVertexSrc',
        get: function get() {
            return ['attribute vec2 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'uniform mat3 projectionMatrix;', 'varying vec2 vTextureCoord;', 'void main(void){', '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);', '   vTextureCoord = aTextureCoord ;', '}'].join('\n');
        }

        /**
         * The default fragment shader source
         *
         * @static
         * @constant
         */

    }, {
        key: 'defaultFragmentSrc',
        get: function get() {
            return ['varying vec2 vTextureCoord;', 'uniform sampler2D uSampler;', 'void main(void){', '   gl_FragColor *= texture2D(uSampler, vTextureCoord);', '}'].join('\n');
        }
    }]);

    return Program;
}();

exports.default = Program;
//# sourceMappingURL=Program.js.map
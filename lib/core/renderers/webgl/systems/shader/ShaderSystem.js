'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('../WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _GLShader = require('./GLShader');

var _GLShader2 = _interopRequireDefault(_GLShader);

var _settings = require('../../../../settings');

var _settings2 = _interopRequireDefault(_settings);

var _generateUniformsSync = require('../../../../shader/generateUniformsSync');

var _generateUniformsSync2 = _interopRequireDefault(_generateUniformsSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UID = 0;

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI
 */

var ShaderSystem = function (_WebGLSystem) {
    _inherits(ShaderSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    function ShaderSystem(renderer) {
        _classCallCheck(this, ShaderSystem);

        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.gl = null;

        _this.shader = null;
        _this.program = null;

        _this.id = UID++;
        return _this;
    }

    ShaderSystem.prototype.contextChange = function contextChange(gl) {
        this.gl = gl;
    };

    /**
     * Changes the current shader to the one given in parameter
     *
     * @param {PIXI.Shader} shader - the new shader
     * @param {boolean} dontSync - false if the shader should automatically sync its uniforms.
     * @returns {PIXI.glCore.GLShader} the glShader that belongs to the shader.
     */


    ShaderSystem.prototype.bind = function bind(shader, dontSync) {
        // maybe a better place for this...
        shader.uniforms.globals = this.renderer.globalUniforms;

        var program = shader.program;
        var glShader = program.glShaders[this.renderer.CONTEXT_UID] || this.generateShader(shader);

        this.shader = shader;

        // TODO - some current pixi plugins bypass this.. so it not safe to use yet..
        if (this.program !== program) {
            this.program = program;
            glShader.bind();
        }

        if (!dontSync) {
            this.syncUniformGroup(shader.uniformGroup);
        }

        return glShader;
    };

    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms valiues that be applied to the current shader
     */


    ShaderSystem.prototype.setUniforms = function setUniforms(uniforms) {
        var shader = this.shader.program;
        var glShader = shader.glShaders[this.renderer.CONTEXT_UID];

        shader.syncUniforms(glShader.uniformData, uniforms, this.renderer);
    };

    ShaderSystem.prototype.syncUniformGroup = function syncUniformGroup(group) {
        var glShader = this.getGLShader();

        if (!group.static || group.dirtyId !== glShader.uniformGroups[group.id]) {
            glShader.uniformGroups[group.id] = group.dirtyId;
            var syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);

            syncFunc(glShader.uniformData, group.uniforms, this.renderer);
        }
    };

    ShaderSystem.prototype.createSyncGroups = function createSyncGroups(group) {
        group.syncUniforms[this.shader.program.id] = (0, _generateUniformsSync2.default)(group, this.shader.program.uniformData);

        return group.syncUniforms[this.shader.program.id];
    };

    /**
     * Returns the underlying GLShade rof the currently bound shader.
     * This can be handy for when you to have a little more control over the setting of your uniforms.
     *
     * @return {PIXI.glCore.Shader} the glShader for the currently bound Shader for this context
     */


    ShaderSystem.prototype.getGLShader = function getGLShader() {
        if (this.shader) {
            return this.shader.program.glShaders[this.renderer.CONTEXT_UID];
        }

        return null;
    };

    /**
     * Generates a GLShader verion of the Shader provided.
     *
     * @private
     * @param {PIXI.Shader} shader the shader that the glShader will be based on.
     * @return {PIXI.glCore.GLShader} A shiney new GLShader
     */


    ShaderSystem.prototype.generateShader = function generateShader(shader) {
        var program = shader.program;
        var attribMap = {};

        // insert the global properties too!

        for (var i in program.attributeData) {
            attribMap[i] = program.attributeData[i].location;
        }

        var glShader = new _GLShader2.default(this.gl, program.vertexSrc, program.fragmentSrc, _settings2.default.PRECISION_FRAGMENT, attribMap);

        program.glShaders[this.renderer.CONTEXT_UID] = glShader;

        return glShader;
    };

    /**
     * Destroys this System and removes all its textures
     */


    ShaderSystem.prototype.destroy = function destroy() {
        // TODO implement destroy method for ShaderSystem
        this.destroyed = true;
    };

    return ShaderSystem;
}(_WebGLSystem3.default);

exports.default = ShaderSystem;
//# sourceMappingURL=ShaderSystem.js.map
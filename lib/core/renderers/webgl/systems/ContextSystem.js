'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _settings = require('../../../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CONTEXT_UID = 0;

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

var ContextSystem = function (_WebGLSystem) {
    _inherits(ContextSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function ContextSystem(renderer) {
        _classCallCheck(this, ContextSystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.webGLVersion = 1;

        _this.handleContextLost = _this.handleContextLost.bind(_this);
        _this.handleContextRestored = _this.handleContextRestored.bind(_this);

        _this.extensions = {};

        renderer.view.addEventListener('webglcontextlost', _this.handleContextLost, false);
        renderer.view.addEventListener('webglcontextrestored', _this.handleContextRestored, false);
        return _this;
    }

    ContextSystem.prototype.contextChange = function contextChange(gl) {
        this.gl = gl;

        // restore a context if it was previously lost
        if (gl.isContextLost() && gl.getExtension('WEBGL_lose_context')) {
            gl.getExtension('WEBGL_lose_context').restoreContext();
        }
    };

    ContextSystem.prototype.initFromContext = function initFromContext(gl) {
        this.gl = gl;
        this.validateContext(gl);
        this.renderer.gl = gl;
        this.renderer.CONTEXT_UID = CONTEXT_UID++;
        this.renderer.runners.contextChange.run(gl);
    };

    ContextSystem.prototype.initFromOptions = function initFromOptions(options) {
        var gl = this.createContext(this.renderer.view, options);

        this.initFromContext(gl);
    };

    /**
     * Helper class to create a webGL Context
     *
     * @class
     * @memberof PIXI.glCore
     * @param canvas {HTMLCanvasElement} the canvas element that we will get the context from
     * @param options {Object} An options object that gets passed in to the canvas element containing the context attributes,
     * see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext for the options available
     * @return {WebGLRenderingContext} the WebGL context
     */


    ContextSystem.prototype.createContext = function createContext(canvas, options) {
        var gl = void 0;

        if (_settings2.default.PREFER_WEBGL_2) {
            gl = canvas.getContext('webgl2', options);
        }

        if (gl) {
            this.webGLVersion = 2;
        } else {
            this.webGLVersion = 1;

            gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);

            if (!gl) {
                // fail, not able to get a context
                throw new Error('This browser does not support webGL. Try using the canvas renderer');
            }
        }

        this.gl = gl;

        this.getExtensions();

        return gl;
    };

    ContextSystem.prototype.getExtensions = function getExtensions() {
        // time to set up default etensions that pixi uses..
        var gl = this.gl;
        var extensions = this.extensions;

        if (this.webGLVersion === 1) {
            extensions.drawBuffers = gl.getExtension('WEBGL_draw_buffers');
            extensions.depthTexture = gl.getExtension('WEBKIT_WEBGL_depth_texture');
            extensions.floatTexture = gl.getExtension('OES_texture_float');
            extensions.loseContext = gl.getExtension('WEBGL_lose_context');

            extensions.vertexArrayObject = gl.getExtension('OES_vertex_array_object') || gl.getExtension('MOZ_OES_vertex_array_object') || gl.getExtension('WEBKIT_OES_vertex_array_object');
        }

        // we don't use any specific WebGL 2 ones yet!
    };

    /**
     * Handles a lost webgl context
     *
     * @private
     * @param {WebGLContextEvent} event - The context lost event.
     */


    ContextSystem.prototype.handleContextLost = function handleContextLost(event) {
        event.preventDefault();
    };

    /**
     * Handles a restored webgl context
     *
     * @private
     */


    ContextSystem.prototype.handleContextRestored = function handleContextRestored() {
        this.renderer.runners.contextChange.run(this.gl);
    };

    ContextSystem.prototype.destroy = function destroy() {
        var view = this.renderer.view;

        // remove listeners
        view.removeEventListener('webglcontextlost', this.handleContextLost);
        view.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.gl.useProgram(null);

        if (this.extensions.loseContext) {
            this.extensions.loseContext.loseContext();
        }
    };

    ContextSystem.prototype.postrender = function postrender() {
        this.gl.flush();
    };

    ContextSystem.prototype.validateContext = function validateContext(gl) {
        var attributes = gl.getContextAttributes();

        // this is going to be fairly simple for now.. but at least we have room to grow!
        if (!attributes.stencil) {
            /* eslint-disable max-len */

            /* eslint-disable no-console */
            console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable no-console */

            /* eslint-enable max-len */
        }
    };

    _createClass(ContextSystem, [{
        key: 'isLost',
        get: function get() {
            return !this.gl || this.gl.isContextLost();
        }
    }]);

    return ContextSystem;
}(_WebGLSystem3.default);

exports.default = ContextSystem;
//# sourceMappingURL=ContextSystem.js.map
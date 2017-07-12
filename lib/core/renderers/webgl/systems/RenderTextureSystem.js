'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _math = require('../../../math');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tempRect = new _math.Rectangle();

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

var RenderTextureSystem = function (_WebGLSystem) {
    _inherits(RenderTextureSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function RenderTextureSystem(renderer) {
        _classCallCheck(this, RenderTextureSystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.clearColor = renderer._backgroundColorRgba;

        // TODO moe this property somewhere else!
        _this.defaultMaskStack = [];

        // empty render texture?
        return _this;
    }

    RenderTextureSystem.prototype.bind = function bind(renderTexture) {
        // TODO - do we want this??
        if (this.renderTexture === renderTexture) return;
        this.renderTexture = renderTexture;
        this.current = renderTexture;

        var renderer = this.renderer;

        if (renderTexture) {
            var baseTexture = renderTexture.baseTexture;

            this.renderer.framebuffer.bind(baseTexture.frameBuffer);
            this.renderer.projection.update(renderTexture.frame, renderTexture.frame, baseTexture.resolution, false);
            this.renderer.stencil.setMaskStack(baseTexture.stencilMaskStack);
        } else {
            renderer.framebuffer.bind(null);

            tempRect.width = renderer.width;
            tempRect.height = renderer.height;

            // TODO store this..
            this.renderer.projection.update(tempRect, tempRect, this.renderer.resolution, true);
            this.renderer.stencil.setMaskStack(this.defaultMaskStack);
        }
    };

    /**
     * Erases the render texture and fills the drawing area with a colour
     *
     * @param {number} [clearColor] - The colour
     * @return {PIXI.WebGLRenderer} Returns itself.
     */


    RenderTextureSystem.prototype.clear = function clear(clearColor) {
        if (this.renderTexture) {
            clearColor = clearColor || this.renderTexture.baseTexture.clearColor;
        } else {
            clearColor = clearColor || this.clearColor;
        }

        this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    };

    RenderTextureSystem.prototype.resize = function resize() // screenWidth, screenHeight)
    {
        // resize the root only!
        this.bind(null);
    };

    return RenderTextureSystem;
}(_WebGLSystem3.default);

exports.default = RenderTextureSystem;
//# sourceMappingURL=RenderTextureSystem.js.map
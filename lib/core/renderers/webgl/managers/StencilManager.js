'use strict';

exports.__esModule = true;

var _WebGLManager2 = require('./WebGLManager');

var _WebGLManager3 = _interopRequireDefault(_WebGLManager2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
var StencilManager = function (_WebGLManager) {
    _inherits(StencilManager, _WebGLManager);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    function StencilManager(renderer) {
        _classCallCheck(this, StencilManager);

        var _this = _possibleConstructorReturn(this, _WebGLManager.call(this, renderer));

        _this.stencilMaskStack = null;
        return _this;
    }

    /**
     * Changes the mask stack that is used by this manager.
     *
     * @param {PIXI.Graphics[]} stencilMaskStack - The mask stack
     */


    StencilManager.prototype.setMaskStack = function setMaskStack(stencilMaskStack) {
        this.stencilMaskStack = stencilMaskStack;

        var gl = this.renderer.gl;

        if (stencilMaskStack.length === 0) {
            gl.disable(gl.STENCIL_TEST);
        } else {
            gl.enable(gl.STENCIL_TEST);
        }
    };

    /**
     * Applies the Mask and adds it to the current filter stack. @alvin
     *
     * @param {PIXI.Graphics} graphics - The mask
     */


    StencilManager.prototype.pushStencil = function pushStencil(graphics) {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        this.renderer._activeRenderTarget.attachStencilBuffer();

        var gl = this.renderer.gl;
        var sms = this.stencilMaskStack;

        if (sms.length === 0) {
            gl.enable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.stencilFunc(gl.ALWAYS, 1, 1);
        }

        sms.push(graphics);

        gl.colorMask(false, false, false, false);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        this.renderer.plugins.graphics.render(graphics);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, sms.length);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };

    /**
     * TODO @alvin
     */


    StencilManager.prototype.popStencil = function popStencil() {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        var gl = this.renderer.gl;
        var sms = this.stencilMaskStack;

        var graphics = sms.pop();

        if (sms.length === 0) {
            // the stack is empty!
            gl.disable(gl.STENCIL_TEST);
        } else {
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

            this.renderer.plugins.graphics.render(graphics);

            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.NOTEQUAL, 0, sms.length);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        }
    };

    /**
     * Destroys the mask stack.
     *
     */


    StencilManager.prototype.destroy = function destroy() {
        _WebGLManager3.default.prototype.destroy.call(this);

        this.stencilMaskStack.stencilStack = null;
    };

    return StencilManager;
}(_WebGLManager3.default);

exports.default = StencilManager;
//# sourceMappingURL=StencilManager.js.map
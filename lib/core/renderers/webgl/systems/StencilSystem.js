'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */
var StencilSystem = function (_WebGLSystem) {
    _inherits(StencilSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function StencilSystem(renderer) {
        _classCallCheck(this, StencilSystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.stencilMaskStack = null;
        return _this;
    }

    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.Graphics[]} stencilMaskStack - The mask stack
     */


    StencilSystem.prototype.setMaskStack = function setMaskStack(stencilMaskStack) {
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


    StencilSystem.prototype.pushStencil = function pushStencil(graphics) {
        this.renderer.batch.setObjectRenderer(this.renderer.plugins.graphics);

        //        this.renderer._activeRenderTarget.attachStencilBuffer();

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


    StencilSystem.prototype.popStencil = function popStencil() {
        this.renderer.batch.setObjectRenderer(this.renderer.plugins.graphics);

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


    StencilSystem.prototype.destroy = function destroy() {
        _WebGLSystem.prototype.destroy.call(this, this);

        this.stencilMaskStack.stencilStack = null;
    };

    return StencilSystem;
}(_WebGLSystem3.default);

exports.default = StencilSystem;
//# sourceMappingURL=StencilSystem.js.map
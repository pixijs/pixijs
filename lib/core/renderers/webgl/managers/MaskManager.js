'use strict';

exports.__esModule = true;

var _WebGLManager2 = require('./WebGLManager');

var _WebGLManager3 = _interopRequireDefault(_WebGLManager2);

var _SpriteMaskFilter = require('../filters/spriteMask/SpriteMaskFilter');

var _SpriteMaskFilter2 = _interopRequireDefault(_SpriteMaskFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
var MaskManager = function (_WebGLManager) {
    _inherits(MaskManager, _WebGLManager);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    function MaskManager(renderer) {
        _classCallCheck(this, MaskManager);

        // TODO - we don't need both!
        var _this = _possibleConstructorReturn(this, _WebGLManager.call(this, renderer));

        _this.scissor = false;
        _this.scissorData = null;
        _this.scissorRenderTarget = null;

        _this.enableScissor = true;

        _this.alphaMaskPool = [];
        _this.alphaMaskIndex = 0;
        return _this;
    }

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.Sprite|PIXI.Graphics} maskData - The masking data.
     */


    MaskManager.prototype.pushMask = function pushMask(target, maskData) {
        // TODO the root check means scissor rect will not
        // be used on render textures more info here:
        // https://github.com/pixijs/pixi.js/pull/3545

        if (maskData.texture) {
            this.pushSpriteMask(target, maskData);
        } else if (this.enableScissor && !this.scissor && this.renderer._activeRenderTarget.root && !this.renderer.stencilManager.stencilMaskStack.length && maskData.isFastRect()) {
            var matrix = maskData.worldTransform;

            var rot = Math.atan2(matrix.b, matrix.a);

            // use the nearest degree!
            rot = Math.round(rot * (180 / Math.PI));

            if (rot % 90) {
                this.pushStencilMask(maskData);
            } else {
                this.pushScissorMask(target, maskData);
            }
        } else {
            this.pushStencilMask(maskData);
        }
    };

    /**
     * Removes the last mask from the mask stack and doesn't return it.
     *
     * @param {PIXI.DisplayObject} target - Display Object to pop the mask from
     * @param {PIXI.Sprite|PIXI.Graphics} maskData - The masking data.
     */


    MaskManager.prototype.popMask = function popMask(target, maskData) {
        if (maskData.texture) {
            this.popSpriteMask(target, maskData);
        } else if (this.enableScissor && !this.renderer.stencilManager.stencilMaskStack.length) {
            this.popScissorMask(target, maskData);
        } else {
            this.popStencilMask(target, maskData);
        }
    };

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.RenderTarget} target - Display Object to push the sprite mask to
     * @param {PIXI.Sprite} maskData - Sprite to be used as the mask
     */


    MaskManager.prototype.pushSpriteMask = function pushSpriteMask(target, maskData) {
        var alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

        if (!alphaMaskFilter) {
            alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new _SpriteMaskFilter2.default(maskData)];
        }

        alphaMaskFilter[0].resolution = this.renderer.resolution;
        alphaMaskFilter[0].maskSprite = maskData;

        // TODO - may cause issues!
        target.filterArea = maskData.getBounds(true);

        this.renderer.filterManager.pushFilter(target, alphaMaskFilter);

        this.alphaMaskIndex++;
    };

    /**
     * Removes the last filter from the filter stack and doesn't return it.
     *
     */


    MaskManager.prototype.popSpriteMask = function popSpriteMask() {
        this.renderer.filterManager.popFilter();
        this.alphaMaskIndex--;
    };

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.Sprite|PIXI.Graphics} maskData - The masking data.
     */


    MaskManager.prototype.pushStencilMask = function pushStencilMask(maskData) {
        this.renderer.currentRenderer.stop();
        this.renderer.stencilManager.pushStencil(maskData);
    };

    /**
     * Removes the last filter from the filter stack and doesn't return it.
     *
     */


    MaskManager.prototype.popStencilMask = function popStencilMask() {
        this.renderer.currentRenderer.stop();
        this.renderer.stencilManager.popStencil();
    };

    /**
     *
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.Graphics} maskData - The masking data.
     */


    MaskManager.prototype.pushScissorMask = function pushScissorMask(target, maskData) {
        maskData.renderable = true;

        var renderTarget = this.renderer._activeRenderTarget;

        var bounds = maskData.getBounds();

        bounds.fit(renderTarget.size);
        maskData.renderable = false;

        this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);

        var resolution = this.renderer.resolution;

        this.renderer.gl.scissor(bounds.x * resolution, (renderTarget.root ? renderTarget.size.height - bounds.y - bounds.height : bounds.y) * resolution, bounds.width * resolution, bounds.height * resolution);

        this.scissorRenderTarget = renderTarget;
        this.scissorData = maskData;
        this.scissor = true;
    };

    /**
     *
     *
     */


    MaskManager.prototype.popScissorMask = function popScissorMask() {
        this.scissorRenderTarget = null;
        this.scissorData = null;
        this.scissor = false;

        // must be scissor!
        var gl = this.renderer.gl;

        gl.disable(gl.SCISSOR_TEST);
    };

    return MaskManager;
}(_WebGLManager3.default);

exports.default = MaskManager;
//# sourceMappingURL=MaskManager.js.map
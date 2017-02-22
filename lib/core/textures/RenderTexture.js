'use strict';

exports.__esModule = true;

var _BaseRenderTexture = require('./BaseRenderTexture');

var _BaseRenderTexture2 = _interopRequireDefault(_BaseRenderTexture);

var _Texture2 = require('./Texture');

var _Texture3 = _interopRequireDefault(_Texture2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A RenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A RenderTexture takes a snapshot of any Display Object given to its render method. For example:
 *
 * ```js
 * let renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * let renderTexture = PIXI.RenderTexture.create(800, 600);
 * let sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderer.render(sprite, renderTexture);
 * ```
 *
 * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
 * you can clear the transform
 *
 * ```js
 *
 * sprite.setTransform()
 *
 * let renderTexture = new PIXI.RenderTexture.create(100, 100);
 *
 * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.Texture
 * @memberof PIXI
 */
var RenderTexture = function (_Texture) {
    _inherits(RenderTexture, _Texture);

    /**
     * @param {PIXI.BaseRenderTexture} baseRenderTexture - The renderer used for this RenderTexture
     * @param {PIXI.Rectangle} [frame] - The rectangle frame of the texture to show
     */
    function RenderTexture(baseRenderTexture, frame) {
        _classCallCheck(this, RenderTexture);

        // support for legacy..
        var _legacyRenderer = null;

        if (!(baseRenderTexture instanceof _BaseRenderTexture2.default)) {
            /* eslint-disable prefer-rest-params, no-console */
            var width = arguments[1];
            var height = arguments[2];
            var scaleMode = arguments[3];
            var resolution = arguments[4];

            // we have an old render texture..
            console.warn('Please use RenderTexture.create(' + width + ', ' + height + ') instead of the ctor directly.');
            _legacyRenderer = arguments[0];
            /* eslint-enable prefer-rest-params, no-console */

            frame = null;
            baseRenderTexture = new _BaseRenderTexture2.default(width, height, scaleMode, resolution);
        }

        /**
         * The base texture object that this texture uses
         *
         * @member {BaseTexture}
         */

        var _this = _possibleConstructorReturn(this, _Texture.call(this, baseRenderTexture, frame));

        _this.legacyRenderer = _legacyRenderer;

        /**
         * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
         *
         * @member {boolean}
         */
        _this.valid = true;

        _this._updateUvs();
        return _this;
    }

    /**
     * Resizes the RenderTexture.
     *
     * @param {number} width - The width to resize to.
     * @param {number} height - The height to resize to.
     * @param {boolean} doNotResizeBaseTexture - Should the baseTexture.width and height values be resized as well?
     */


    RenderTexture.prototype.resize = function resize(width, height, doNotResizeBaseTexture) {
        // TODO - could be not required..
        this.valid = width > 0 && height > 0;

        this._frame.width = this.orig.width = width;
        this._frame.height = this.orig.height = height;

        if (!doNotResizeBaseTexture) {
            this.baseTexture.resize(width, height);
        }

        this._updateUvs();
    };

    /**
     * A short hand way of creating a render texture.
     *
     * @param {number} [width=100] - The width of the render texture
     * @param {number} [height=100] - The height of the render texture
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the texture being generated
     * @return {PIXI.RenderTexture} The new render texture
     */


    RenderTexture.create = function create(width, height, scaleMode, resolution) {
        return new RenderTexture(new _BaseRenderTexture2.default(width, height, scaleMode, resolution));
    };

    return RenderTexture;
}(_Texture3.default);

exports.default = RenderTexture;
//# sourceMappingURL=RenderTexture.js.map
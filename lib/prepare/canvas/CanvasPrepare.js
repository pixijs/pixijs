'use strict';

exports.__esModule = true;

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _BasePrepare2 = require('../BasePrepare');

var _BasePrepare3 = _interopRequireDefault(_BasePrepare2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CANVAS_START_SIZE = 16;

/**
 * The prepare manager provides functionality to upload content to the GPU
 * This cannot be done directly for Canvas like in WebGL, but the effect can be achieved by drawing
 * textures to an offline canvas.
 * This draw call will force the texture to be moved onto the GPU.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.prepare
 *
 * @class
 * @extends PIXI.prepare.BasePrepare
 * @memberof PIXI.prepare
 */

var CanvasPrepare = function (_BasePrepare) {
    _inherits(CanvasPrepare, _BasePrepare);

    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    function CanvasPrepare(renderer) {
        _classCallCheck(this, CanvasPrepare);

        var _this = _possibleConstructorReturn(this, _BasePrepare.call(this, renderer));

        _this.uploadHookHelper = _this;

        /**
        * An offline canvas to render textures to
        * @type {HTMLCanvasElement}
        * @private
        */
        _this.canvas = document.createElement('canvas');
        _this.canvas.width = CANVAS_START_SIZE;
        _this.canvas.height = CANVAS_START_SIZE;

        /**
         * The context to the canvas
        * @type {CanvasRenderingContext2D}
        * @private
        */
        _this.ctx = _this.canvas.getContext('2d');

        // Add textures to upload
        _this.registerUploadHook(uploadBaseTextures);
        return _this;
    }

    /**
     * Destroys the plugin, don't use after this.
     *
     */


    CanvasPrepare.prototype.destroy = function destroy() {
        _BasePrepare.prototype.destroy.call(this);
        this.ctx = null;
        this.canvas = null;
    };

    return CanvasPrepare;
}(_BasePrepare3.default);

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {*} prepare - Instance of CanvasPrepare
 * @param {*} item - Item to check
 * @return {boolean} If item was uploaded.
 */


exports.default = CanvasPrepare;
function uploadBaseTextures(prepare, item) {
    if (item instanceof core.BaseTexture) {
        var image = item.source;

        // Sometimes images (like atlas images) report a size of zero, causing errors on windows phone.
        // So if the width or height is equal to zero then use the canvas size
        // Otherwise use whatever is smaller, the image dimensions or the canvas dimensions.
        var imageWidth = image.width === 0 ? prepare.canvas.width : Math.min(prepare.canvas.width, image.width);
        var imageHeight = image.height === 0 ? prepare.canvas.height : Math.min(prepare.canvas.height, image.height);

        // Only a small subsections is required to be drawn to have the whole texture uploaded to the GPU
        // A smaller draw can be faster.
        prepare.ctx.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, prepare.canvas.width, prepare.canvas.height);

        return true;
    }

    return false;
}

core.CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
//# sourceMappingURL=CanvasPrepare.js.map
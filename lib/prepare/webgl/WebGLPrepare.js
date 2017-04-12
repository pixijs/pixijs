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

/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.prepare
 *
 * @class
 * @extends PIXI.prepare.BasePrepare
 * @memberof PIXI.prepare
 */
var WebGLPrepare = function (_BasePrepare) {
    _inherits(WebGLPrepare, _BasePrepare);

    /**
     * @param {PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    function WebGLPrepare(renderer) {
        _classCallCheck(this, WebGLPrepare);

        var _this = _possibleConstructorReturn(this, _BasePrepare.call(this, renderer));

        _this.uploadHookHelper = _this.renderer;

        // Add textures and graphics to upload
        _this.registerFindHook(findGraphics);
        _this.registerUploadHook(uploadBaseTextures);
        _this.registerUploadHook(uploadGraphics);
        return _this;
    }

    return WebGLPrepare;
}(_BasePrepare3.default);
/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {PIXI.WebGLRenderer} renderer - instance of the webgl renderer
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */


exports.default = WebGLPrepare;
function uploadBaseTextures(renderer, item) {
    if (item instanceof core.BaseTexture) {
        // if the texture already has a GL texture, then the texture has been prepared or rendered
        // before now. If the texture changed, then the changer should be calling texture.update() which
        // reuploads the texture without need for preparing it again
        if (!item._glTextures[renderer.CONTEXT_UID]) {
            renderer.textureManager.updateTexture(item);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to upload PIXI.Graphics to the GPU.
 *
 * @private
 * @param {PIXI.WebGLRenderer} renderer - instance of the webgl renderer
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadGraphics(renderer, item) {
    if (item instanceof core.Graphics) {
        // if the item is not dirty and already has webgl data, then it got prepared or rendered
        // before now and we shouldn't waste time updating it again
        if (item.dirty || item.clearDirty || !item._webGL[renderer.plugins.graphics.CONTEXT_UID]) {
            renderer.plugins.graphics.updateGraphics(item);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to find graphics.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Graphics object was found.
 */
function findGraphics(item, queue) {
    if (item instanceof core.Graphics) {
        queue.push(item);

        return true;
    }

    return false;
}

core.WebGLRenderer.registerPlugin('prepare', WebGLPrepare);
//# sourceMappingURL=WebGLPrepare.js.map
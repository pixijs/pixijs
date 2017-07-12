'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('../WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _const = require('../../../../const');

var _settings = require('../../../../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * TextureGarbageCollector. This class manages the GPU and ensures that it does not get clogged
 * up with textures that are no longer being used.
 *
 * @class
 * @memberof PIXI
 */
var TextureGCSystem = function (_WebGLSystem) {
    _inherits(TextureGCSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function TextureGCSystem(renderer) {
        _classCallCheck(this, TextureGCSystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.count = 0;
        _this.checkCount = 0;
        _this.maxIdle = _settings2.default.GC_MAX_IDLE;
        _this.checkCountMax = _settings2.default.GC_MAX_CHECK_COUNT;
        _this.mode = _settings2.default.GC_MODE;
        return _this;
    }

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */


    TextureGCSystem.prototype.postrender = function postrender() {
        this.count++;

        if (this.mode === _const.GC_MODES.MANUAL) {
            return;
        }

        this.checkCount++;

        if (this.checkCount > this.checkCountMax) {
            this.checkCount = 0;

            this.run();
        }
    };

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */


    TextureGCSystem.prototype.run = function run() {
        var tm = this.renderer.texture;
        var managedTextures = tm.managedTextures;
        var wasRemoved = false;

        for (var i = 0; i < managedTextures.length; i++) {
            var texture = managedTextures[i];

            // only supports non generated textures at the moment!
            if (!texture.frameBuffer && this.count - texture.touched > this.maxIdle) {
                tm.destroyTexture(texture, true);
                managedTextures[i] = null;
                wasRemoved = true;
            }
        }

        if (wasRemoved) {
            var j = 0;

            for (var _i = 0; _i < managedTextures.length; _i++) {
                if (managedTextures[_i] !== null) {
                    managedTextures[j++] = managedTextures[_i];
                }
            }

            managedTextures.length = j;
        }
    };

    /**
     * Removes all the textures within the specified displayObject and its children from the GPU
     *
     * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
     */


    TextureGCSystem.prototype.unload = function unload(displayObject) {
        var tm = this.renderer.textureSystem;

        // only destroy non generated textures
        if (displayObject._texture && displayObject._texture._glRenderTargets) {
            tm.destroyTexture(displayObject._texture, true);
        }

        for (var i = displayObject.children.length - 1; i >= 0; i--) {
            this.unload(displayObject.children[i]);
        }
    };

    return TextureGCSystem;
}(_WebGLSystem3.default);

exports.default = TextureGCSystem;
//# sourceMappingURL=TextureGCSystem.js.map
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _CanvasTinter = require('../core/sprites/canvas/CanvasTinter');

var _CanvasTinter2 = _interopRequireDefault(_CanvasTinter);

var _TextureTransform = require('./TextureTransform');

var _TextureTransform2 = _interopRequireDefault(_TextureTransform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tempPoint = new core.Point();

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 */

var TilingSprite = function (_core$Sprite) {
    _inherits(TilingSprite, _core$Sprite);

    /**
     * @param {PIXI.Texture} texture - the texture of the tiling sprite
     * @param {number} [width=100] - the width of the tiling sprite
     * @param {number} [height=100] - the height of the tiling sprite
     */
    function TilingSprite(texture) {
        var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
        var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

        _classCallCheck(this, TilingSprite);

        /**
         * Tile transform
         *
         * @member {PIXI.TransformStatic}
         */
        var _this = _possibleConstructorReturn(this, _core$Sprite.call(this, texture));

        _this.tileTransform = new core.TransformStatic();

        // /// private

        /**
         * The with of the tiling sprite
         *
         * @member {number}
         * @private
         */
        _this._width = width;

        /**
         * The height of the tiling sprite
         *
         * @member {number}
         * @private
         */
        _this._height = height;

        /**
         * Canvas pattern
         *
         * @type {CanvasPattern}
         * @private
         */
        _this._canvasPattern = null;

        /**
         * transform that is applied to UV to get the texture coords
         *
         * @member {PIXI.extras.TextureTransform}
         */
        _this.uvTransform = texture.transform || new _TextureTransform2.default(texture);

        /**
         * Plugin that is responsible for rendering this element.
         * Allows to customize the rendering process without overriding '_renderWebGL' method.
         *
         * @member {string}
         * @default 'tilingSprite'
         */
        _this.pluginName = 'tilingSprite';

        /**
         * Whether or not anchor affects uvs
         *
         * @member {boolean}
         * @default false
         */
        _this.uvRespectAnchor = false;
        return _this;
    }
    /**
     * Changes frame clamping in corresponding textureTransform, shortcut
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     *
     * @default 0.5
     * @member {number}
     */


    /**
     * @private
     */
    TilingSprite.prototype._onTextureUpdate = function _onTextureUpdate() {
        if (this.uvTransform) {
            this.uvTransform.texture = this._texture;
        }
    };

    /**
     * Renders the object using the WebGL renderer
     *
     * @private
     * @param {PIXI.WebGLRenderer} renderer - The renderer
     */


    TilingSprite.prototype._renderWebGL = function _renderWebGL(renderer) {
        // tweak our texture temporarily..
        var texture = this._texture;

        if (!texture || !texture.valid) {
            return;
        }

        this.tileTransform.updateLocalTransform();
        this.uvTransform.update();

        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    };

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
     */


    TilingSprite.prototype._renderCanvas = function _renderCanvas(renderer) {
        var texture = this._texture;

        if (!texture.baseTexture.hasLoaded) {
            return;
        }

        var context = renderer.context;
        var transform = this.worldTransform;
        var resolution = renderer.resolution;
        var baseTexture = texture.baseTexture;
        var baseTextureResolution = baseTexture.resolution;
        var modX = this.tilePosition.x / this.tileScale.x % texture._frame.width * baseTextureResolution;
        var modY = this.tilePosition.y / this.tileScale.y % texture._frame.height * baseTextureResolution;

        // create a nice shiny pattern!
        // TODO this needs to be refreshed if texture changes..
        if (!this._canvasPattern) {
            // cut an object from a spritesheet..
            var tempCanvas = new core.CanvasRenderTarget(texture._frame.width, texture._frame.height, baseTextureResolution);

            // Tint the tiling sprite
            if (this.tint !== 0xFFFFFF) {
                if (this.cachedTint !== this.tint) {
                    this.cachedTint = this.tint;

                    this.tintedTexture = _CanvasTinter2.default.getTintedTexture(this, this.tint);
                }
                tempCanvas.context.drawImage(this.tintedTexture, 0, 0);
            } else {
                tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x * baseTextureResolution, -texture._frame.y * baseTextureResolution);
            }
            this._canvasPattern = tempCanvas.context.createPattern(tempCanvas.canvas, 'repeat');
        }

        // set context state..
        context.globalAlpha = this.worldAlpha;
        context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);

        renderer.setBlendMode(this.blendMode);

        // fill the pattern!
        context.fillStyle = this._canvasPattern;

        // TODO - this should be rolled into the setTransform above..
        context.scale(this.tileScale.x / baseTextureResolution, this.tileScale.y / baseTextureResolution);

        var anchorX = this.anchor.x * -this._width;
        var anchorY = this.anchor.y * -this._height;

        if (this.uvRespectAnchor) {
            context.translate(modX, modY);

            context.fillRect(-modX + anchorX, -modY + anchorY, this._width / this.tileScale.x * baseTextureResolution, this._height / this.tileScale.y * baseTextureResolution);
        } else {
            context.translate(modX + anchorX, modY + anchorY);

            context.fillRect(-modX, -modY, this._width / this.tileScale.x * baseTextureResolution, this._height / this.tileScale.y * baseTextureResolution);
        }
    };

    /**
     * Updates the bounds of the tiling sprite.
     *
     * @private
     */


    TilingSprite.prototype._calculateBounds = function _calculateBounds() {
        var minX = this._width * -this._anchor._x;
        var minY = this._height * -this._anchor._y;
        var maxX = this._width * (1 - this._anchor._x);
        var maxY = this._height * (1 - this._anchor._y);

        this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
    };

    /**
     * Gets the local bounds of the sprite object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */


    TilingSprite.prototype.getLocalBounds = function getLocalBounds(rect) {
        // we can do a fast local bounds if the sprite has no children!
        if (this.children.length === 0) {
            this._bounds.minX = this._width * -this._anchor._x;
            this._bounds.minY = this._height * -this._anchor._y;
            this._bounds.maxX = this._width * (1 - this._anchor._x);
            this._bounds.maxY = this._height * (1 - this._anchor._x);

            if (!rect) {
                if (!this._localBoundsRect) {
                    this._localBoundsRect = new core.Rectangle();
                }

                rect = this._localBoundsRect;
            }

            return this._bounds.getRectangle(rect);
        }

        return _core$Sprite.prototype.getLocalBounds.call(this, rect);
    };

    /**
     * Checks if a point is inside this tiling sprite.
     *
     * @param {PIXI.Point} point - the point to check
     * @return {boolean} Whether or not the sprite contains the point.
     */


    TilingSprite.prototype.containsPoint = function containsPoint(point) {
        this.worldTransform.applyInverse(point, tempPoint);

        var width = this._width;
        var height = this._height;
        var x1 = -width * this.anchor._x;

        if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
            var y1 = -height * this.anchor._y;

            if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
                return true;
            }
        }

        return false;
    };

    /**
     * Destroys this sprite and optionally its texture and children
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
     */


    TilingSprite.prototype.destroy = function destroy(options) {
        _core$Sprite.prototype.destroy.call(this, options);

        this.tileTransform = null;
        this.uvTransform = null;
    };

    /**
     * Helper function that creates a new tiling sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @param {number} width - the width of the tiling sprite
     * @param {number} height - the height of the tiling sprite
     * @return {PIXI.Texture} The newly created texture
     */


    TilingSprite.from = function from(source, width, height) {
        return new TilingSprite(core.Texture.from(source), width, height);
    };

    /**
     * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
     * The frame ids are created when a Texture packer file has been loaded
     *
     * @static
     * @param {string} frameId - The frame Id of the texture in the cache
     * @param {number} width - the width of the tiling sprite
     * @param {number} height - the height of the tiling sprite
     * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
     */


    TilingSprite.fromFrame = function fromFrame(frameId, width, height) {
        var texture = core.utils.TextureCache[frameId];

        if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
        }

        return new TilingSprite(texture, width, height);
    };

    /**
     * Helper function that creates a sprite that will contain a texture based on an image url
     * If the image is not in the texture cache it will be loaded
     *
     * @static
     * @param {string} imageId - The image url of the texture
     * @param {number} width - the width of the tiling sprite
     * @param {number} height - the height of the tiling sprite
     * @param {boolean} [crossorigin] - if you want to specify the cross-origin parameter
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - if you want to specify the scale mode,
     *  see {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
     */


    TilingSprite.fromImage = function fromImage(imageId, width, height, crossorigin, scaleMode) {
        return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode), width, height);
    };

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */


    _createClass(TilingSprite, [{
        key: 'clampMargin',
        get: function get() {
            return this.uvTransform.clampMargin;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.uvTransform.clampMargin = value;
            this.uvTransform.update(true);
        }

        /**
         * The scaling of the image that is being tiled
         *
         * @member {PIXI.ObservablePoint}
         */

    }, {
        key: 'tileScale',
        get: function get() {
            return this.tileTransform.scale;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.tileTransform.scale.copy(value);
        }

        /**
         * The offset of the image that is being tiled
         *
         * @member {PIXI.ObservablePoint}
         */

    }, {
        key: 'tilePosition',
        get: function get() {
            return this.tileTransform.position;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.tileTransform.position.copy(value);
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._width = value;
        }

        /**
         * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         */

    }, {
        key: 'height',
        get: function get() {
            return this._height;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._height = value;
        }
    }]);

    return TilingSprite;
}(core.Sprite);

exports.default = TilingSprite;
//# sourceMappingURL=TilingSprite.js.map
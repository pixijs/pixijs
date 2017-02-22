'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _math = require('../math');

var _utils = require('../utils');

var _const = require('../const');

var _Texture = require('../textures/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _Container2 = require('../display/Container');

var _Container3 = _interopRequireDefault(_Container2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tempPoint = new _math.Point();

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * let sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */

var Sprite = function (_Container) {
    _inherits(Sprite, _Container);

    /**
     * @param {PIXI.Texture} texture - The texture for this sprite
     */
    function Sprite(texture) {
        _classCallCheck(this, Sprite);

        /**
         * The anchor sets the origin point of the texture.
         * The default is 0,0 this means the texture's origin is the top left
         * Setting the anchor to 0.5,0.5 means the texture's origin is centered
         * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        var _this = _possibleConstructorReturn(this, _Container.call(this));

        _this._anchor = new _math.ObservablePoint(_this._onAnchorUpdate, _this);

        /**
         * The texture that the sprite is using
         *
         * @private
         * @member {PIXI.Texture}
         */
        _this._texture = null;

        /**
         * The width of the sprite (this is initially set by the texture)
         *
         * @private
         * @member {number}
         */
        _this._width = 0;

        /**
         * The height of the sprite (this is initially set by the texture)
         *
         * @private
         * @member {number}
         */
        _this._height = 0;

        /**
         * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
         *
         * @private
         * @member {number}
         * @default 0xFFFFFF
         */
        _this._tint = null;
        _this._tintRGB = null;
        _this.tint = 0xFFFFFF;

        /**
         * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */
        _this.blendMode = _const.BLEND_MODES.NORMAL;

        /**
         * The shader that will be used to render the sprite. Set to null to remove a current shader.
         *
         * @member {PIXI.Filter|PIXI.Shader}
         */
        _this.shader = null;

        /**
         * An internal cached value of the tint.
         *
         * @private
         * @member {number}
         * @default 0xFFFFFF
         */
        _this.cachedTint = 0xFFFFFF;

        // call texture setter
        _this.texture = texture || _Texture2.default.EMPTY;

        /**
         * this is used to store the vertex data of the sprite (basically a quad)
         *
         * @private
         * @member {Float32Array}
         */
        _this.vertexData = new Float32Array(8);

        /**
         * This is used to calculate the bounds of the object IF it is a trimmed sprite
         *
         * @private
         * @member {Float32Array}
         */
        _this.vertexTrimmedData = null;

        _this._transformID = -1;
        _this._textureID = -1;

        _this._transformTrimmedID = -1;
        _this._textureTrimmedID = -1;

        /**
         * Plugin that is responsible for rendering this element.
         * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
         *
         * @member {string}
         * @default 'sprite'
         */
        _this.pluginName = 'sprite';
        return _this;
    }

    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */


    Sprite.prototype._onTextureUpdate = function _onTextureUpdate() {
        this._textureID = -1;
        this._textureTrimmedID = -1;

        // so if _width is 0 then width was not set..
        if (this._width) {
            this.scale.x = (0, _utils.sign)(this.scale.x) * this._width / this.texture.orig.width;
        }

        if (this._height) {
            this.scale.y = (0, _utils.sign)(this.scale.y) * this._height / this.texture.orig.height;
        }
    };

    /**
     * Called when the anchor position updates.
     *
     * @private
     */


    Sprite.prototype._onAnchorUpdate = function _onAnchorUpdate() {
        this._transformID = -1;
        this._transformTrimmedID = -1;
    };

    /**
     * calculates worldTransform * vertices, store it in vertexData
     */


    Sprite.prototype.calculateVertices = function calculateVertices() {
        if (this._transformID === this.transform._worldID && this._textureID === this._texture._updateID) {
            return;
        }

        this._transformID = this.transform._worldID;
        this._textureID = this._texture._updateID;

        // set the vertex data

        var texture = this._texture;
        var wt = this.transform.worldTransform;
        var a = wt.a;
        var b = wt.b;
        var c = wt.c;
        var d = wt.d;
        var tx = wt.tx;
        var ty = wt.ty;
        var vertexData = this.vertexData;
        var trim = texture.trim;
        var orig = texture.orig;
        var anchor = this._anchor;

        var w0 = 0;
        var w1 = 0;
        var h0 = 0;
        var h1 = 0;

        if (trim) {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
            // space before transforming the sprite coords.
            w1 = trim.x - anchor._x * orig.width;
            w0 = w1 + trim.width;

            h1 = trim.y - anchor._y * orig.height;
            h0 = h1 + trim.height;
        } else {
            w1 = -anchor._x * orig.width;
            w0 = w1 + orig.width;

            h1 = -anchor._y * orig.height;
            h0 = h1 + orig.height;
        }

        // xy
        vertexData[0] = a * w1 + c * h1 + tx;
        vertexData[1] = d * h1 + b * w1 + ty;

        // xy
        vertexData[2] = a * w0 + c * h1 + tx;
        vertexData[3] = d * h1 + b * w0 + ty;

        // xy
        vertexData[4] = a * w0 + c * h0 + tx;
        vertexData[5] = d * h0 + b * w0 + ty;

        // xy
        vertexData[6] = a * w1 + c * h0 + tx;
        vertexData[7] = d * h0 + b * w1 + ty;
    };

    /**
     * calculates worldTransform * vertices for a non texture with a trim. store it in vertexTrimmedData
     * This is used to ensure that the true width and height of a trimmed texture is respected
     */


    Sprite.prototype.calculateTrimmedVertices = function calculateTrimmedVertices() {
        if (!this.vertexTrimmedData) {
            this.vertexTrimmedData = new Float32Array(8);
        } else if (this._transformTrimmedID === this.transform._worldID && this._textureTrimmedID === this._texture._updateID) {
            return;
        }

        this._transformTrimmedID = this.transform._worldID;
        this._textureTrimmedID = this._texture._updateID;

        // lets do some special trim code!
        var texture = this._texture;
        var vertexData = this.vertexTrimmedData;
        var orig = texture.orig;
        var anchor = this._anchor;

        // lets calculate the new untrimmed bounds..
        var wt = this.transform.worldTransform;
        var a = wt.a;
        var b = wt.b;
        var c = wt.c;
        var d = wt.d;
        var tx = wt.tx;
        var ty = wt.ty;

        var w1 = -anchor._x * orig.width;
        var w0 = w1 + orig.width;

        var h1 = -anchor._y * orig.height;
        var h0 = h1 + orig.height;

        // xy
        vertexData[0] = a * w1 + c * h1 + tx;
        vertexData[1] = d * h1 + b * w1 + ty;

        // xy
        vertexData[2] = a * w0 + c * h1 + tx;
        vertexData[3] = d * h1 + b * w0 + ty;

        // xy
        vertexData[4] = a * w0 + c * h0 + tx;
        vertexData[5] = d * h0 + b * w0 + ty;

        // xy
        vertexData[6] = a * w1 + c * h0 + tx;
        vertexData[7] = d * h0 + b * w1 + ty;
    };

    /**
    *
    * Renders the object using the WebGL renderer
    *
    * @private
    * @param {PIXI.WebGLRenderer} renderer - The webgl renderer to use.
    */


    Sprite.prototype._renderWebGL = function _renderWebGL(renderer) {
        this.calculateVertices();

        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    };

    /**
    * Renders the object using the Canvas renderer
    *
    * @private
    * @param {PIXI.CanvasRenderer} renderer - The renderer
    */


    Sprite.prototype._renderCanvas = function _renderCanvas(renderer) {
        renderer.plugins[this.pluginName].render(this);
    };

    /**
     * Updates the bounds of the sprite.
     *
     * @private
     */


    Sprite.prototype._calculateBounds = function _calculateBounds() {
        var trim = this._texture.trim;
        var orig = this._texture.orig;

        // First lets check to see if the current texture has a trim..
        if (!trim || trim.width === orig.width && trim.height === orig.height) {
            // no trim! lets use the usual calculations..
            this.calculateVertices();
            this._bounds.addQuad(this.vertexData);
        } else {
            // lets calculate a special trimmed bounds...
            this.calculateTrimmedVertices();
            this._bounds.addQuad(this.vertexTrimmedData);
        }
    };

    /**
     * Gets the local bounds of the sprite object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */


    Sprite.prototype.getLocalBounds = function getLocalBounds(rect) {
        // we can do a fast local bounds if the sprite has no children!
        if (this.children.length === 0) {
            this._bounds.minX = this._texture.orig.width * -this._anchor._x;
            this._bounds.minY = this._texture.orig.height * -this._anchor._y;
            this._bounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
            this._bounds.maxY = this._texture.orig.height * (1 - this._anchor._x);

            if (!rect) {
                if (!this._localBoundsRect) {
                    this._localBoundsRect = new _math.Rectangle();
                }

                rect = this._localBoundsRect;
            }

            return this._bounds.getRectangle(rect);
        }

        return _Container.prototype.getLocalBounds.call(this, rect);
    };

    /**
     * Tests if a point is inside this sprite
     *
     * @param {PIXI.Point} point - the point to test
     * @return {boolean} the result of the test
     */


    Sprite.prototype.containsPoint = function containsPoint(point) {
        this.worldTransform.applyInverse(point, tempPoint);

        var width = this._texture.orig.width;
        var height = this._texture.orig.height;
        var x1 = -width * this.anchor.x;
        var y1 = 0;

        if (tempPoint.x > x1 && tempPoint.x < x1 + width) {
            y1 = -height * this.anchor.y;

            if (tempPoint.y > y1 && tempPoint.y < y1 + height) {
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


    Sprite.prototype.destroy = function destroy(options) {
        _Container.prototype.destroy.call(this, options);

        this._anchor = null;

        var destroyTexture = typeof options === 'boolean' ? options : options && options.texture;

        if (destroyTexture) {
            var destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;

            this._texture.destroy(!!destroyBaseTexture);
        }

        this._texture = null;
        this.shader = null;
    };

    // some helper functions..

    /**
     * Helper function that creates a new sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source Source to create texture from
     * @return {PIXI.Sprite} The newly created sprite
     */


    Sprite.from = function from(source) {
        return new Sprite(_Texture2.default.from(source));
    };

    /**
     * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
     * The frame ids are created when a Texture packer file has been loaded
     *
     * @static
     * @param {string} frameId - The frame Id of the texture in the cache
     * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the frameId
     */


    Sprite.fromFrame = function fromFrame(frameId) {
        var texture = _utils.TextureCache[frameId];

        if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
        }

        return new Sprite(texture);
    };

    /**
     * Helper function that creates a sprite that will contain a texture based on an image url
     * If the image is not in the texture cache it will be loaded
     *
     * @static
     * @param {string} imageId - The image url of the texture
     * @param {boolean} [crossorigin=(auto)] - if you want to specify the cross-origin parameter
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - if you want to specify the scale mode,
     *  see {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the image id
     */


    Sprite.fromImage = function fromImage(imageId, crossorigin, scaleMode) {
        return new Sprite(_Texture2.default.fromImage(imageId, crossorigin, scaleMode));
    };

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */


    _createClass(Sprite, [{
        key: 'width',
        get: function get() {
            return Math.abs(this.scale.x) * this._texture.orig.width;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            var s = (0, _utils.sign)(this.scale.x) || 1;

            this.scale.x = s * value / this._texture.orig.width;
            this._width = value;
        }

        /**
         * The height of the sprite, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         */

    }, {
        key: 'height',
        get: function get() {
            return Math.abs(this.scale.y) * this._texture.orig.height;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            var s = (0, _utils.sign)(this.scale.y) || 1;

            this.scale.y = s * value / this._texture.orig.height;
            this._height = value;
        }

        /**
         * The anchor sets the origin point of the texture.
         * The default is 0,0 this means the texture's origin is the top left
         * Setting the anchor to 0.5,0.5 means the texture's origin is centered
         * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
         *
         * @member {PIXI.ObservablePoint}
         */

    }, {
        key: 'anchor',
        get: function get() {
            return this._anchor;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._anchor.copy(value);
        }

        /**
         * The tint applied to the sprite. This is a hex value.
         * A value of 0xFFFFFF will remove any tint effect.
         *
         * @member {number}
         * @default 0xFFFFFF
         */

    }, {
        key: 'tint',
        get: function get() {
            return this._tint;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._tint = value;
            this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        }

        /**
         * The texture that the sprite is using
         *
         * @member {PIXI.Texture}
         */

    }, {
        key: 'texture',
        get: function get() {
            return this._texture;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (this._texture === value) {
                return;
            }

            this._texture = value;
            this.cachedTint = 0xFFFFFF;

            this._textureID = -1;
            this._textureTrimmedID = -1;

            if (value) {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded) {
                    this._onTextureUpdate();
                } else {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    }]);

    return Sprite;
}(_Container3.default);

exports.default = Sprite;
//# sourceMappingURL=Sprite.js.map
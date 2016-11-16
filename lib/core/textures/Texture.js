'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseTexture = require('./BaseTexture');

var _BaseTexture2 = _interopRequireDefault(_BaseTexture);

var _VideoBaseTexture = require('./VideoBaseTexture');

var _VideoBaseTexture2 = _interopRequireDefault(_VideoBaseTexture);

var _TextureUvs = require('./TextureUvs');

var _TextureUvs2 = _interopRequireDefault(_TextureUvs);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _math = require('../math');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A texture stores the information that represents an image or part of an image. It cannot be added
 * to the display list directly. Instead use it as the texture for a Sprite. If no frame is provided
 * then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * let texture = PIXI.Texture.fromImage('assets/image.png');
 * let sprite1 = new PIXI.Sprite(texture);
 * let sprite2 = new PIXI.Sprite(texture);
 * ```
 *
 * Textures made from SVGs, loaded or not, cannot be used before the file finishes processing.
 * You can check for this by checking the sprite's _textureID property.
 * ```js
 * var texture = PIXI.Texture.fromImage('assets/image.svg');
 * var sprite1 = new PIXI.Sprite(texture);
 * //sprite1._textureID should not be undefined if the texture has finished processing the SVG file
 * ```
 * You can use a ticker or rAF to ensure your sprites load the finished textures after processing. See issue #3068.
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
var Texture = function (_EventEmitter) {
    _inherits(Texture, _EventEmitter);

    /**
     * @param {PIXI.BaseTexture} baseTexture - The base texture source to create the texture from
     * @param {PIXI.Rectangle} [frame] - The rectangle frame of the texture to show
     * @param {PIXI.Rectangle} [orig] - The area of original texture
     * @param {PIXI.Rectangle} [trim] - Trimmed rectangle of original texture
     * @param {number} [rotate] - indicates how the texture was rotated by texture packer. See {@link PIXI.GroupD8}
     */
    function Texture(baseTexture, frame, orig, trim, rotate) {
        _classCallCheck(this, Texture);

        /**
         * Does this Texture have any frame data assigned to it?
         *
         * @member {boolean}
         */
        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        _this.noFrame = false;

        if (!frame) {
            _this.noFrame = true;
            frame = new _math.Rectangle(0, 0, 1, 1);
        }

        if (baseTexture instanceof Texture) {
            baseTexture = baseTexture.baseTexture;
        }

        /**
         * The base texture that this texture uses.
         *
         * @member {PIXI.BaseTexture}
         */
        _this.baseTexture = baseTexture;

        /**
         * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
         * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
         *
         * @member {PIXI.Rectangle}
         */
        _this._frame = frame;

        /**
         * This is the trimmed area of original texture, before it was put in atlas
         *
         * @member {PIXI.Rectangle}
         */
        _this.trim = trim;

        /**
         * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
         *
         * @member {boolean}
         */
        _this.valid = false;

        /**
         * This will let a renderer know that a texture has been updated (used mainly for webGL uv updates)
         *
         * @member {boolean}
         */
        _this.requiresUpdate = false;

        /**
         * The WebGL UV data cache.
         *
         * @member {PIXI.TextureUvs}
         * @private
         */
        _this._uvs = null;

        /**
         * This is the area of original texture, before it was put in atlas
         *
         * @member {PIXI.Rectangle}
         */
        _this.orig = orig || frame; // new Rectangle(0, 0, 1, 1);

        _this._rotate = Number(rotate || 0);

        if (rotate === true) {
            // this is old texturepacker legacy, some games/libraries are passing "true" for rotated textures
            _this._rotate = 2;
        } else if (_this._rotate % 2 !== 0) {
            throw new Error('attempt to use diamond-shaped UVs. If you are sure, set rotation manually');
        }

        if (baseTexture.hasLoaded) {
            if (_this.noFrame) {
                frame = new _math.Rectangle(0, 0, baseTexture.width, baseTexture.height);

                // if there is no frame we should monitor for any base texture changes..
                baseTexture.on('update', _this.onBaseTextureUpdated, _this);
            }
            _this.frame = frame;
        } else {
            baseTexture.once('loaded', _this.onBaseTextureLoaded, _this);
        }

        /**
         * Fired when the texture is updated. This happens if the frame or the baseTexture is updated.
         *
         * @event update
         * @memberof PIXI.Texture#
         * @protected
         */

        _this._updateID = 0;

        /**
         * Extra field for extra plugins. May contain clamp settings and some matrices
         * @type {Object}
         */
        _this.transform = null;
        return _this;
    }

    /**
     * Updates this texture on the gpu.
     *
     */


    Texture.prototype.update = function update() {
        this.baseTexture.update();
    };

    /**
     * Called when the base texture is loaded
     *
     * @private
     * @param {PIXI.BaseTexture} baseTexture - The base texture.
     */


    Texture.prototype.onBaseTextureLoaded = function onBaseTextureLoaded(baseTexture) {
        this._updateID++;

        // TODO this code looks confusing.. boo to abusing getters and setters!
        if (this.noFrame) {
            this.frame = new _math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
        } else {
            this.frame = this._frame;
        }

        this.baseTexture.on('update', this.onBaseTextureUpdated, this);
        this.emit('update', this);
    };

    /**
     * Called when the base texture is updated
     *
     * @private
     * @param {PIXI.BaseTexture} baseTexture - The base texture.
     */


    Texture.prototype.onBaseTextureUpdated = function onBaseTextureUpdated(baseTexture) {
        this._updateID++;

        this._frame.width = baseTexture.width;
        this._frame.height = baseTexture.height;

        this.emit('update', this);
    };

    /**
     * Destroys this texture
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
     */


    Texture.prototype.destroy = function destroy(destroyBase) {
        if (this.baseTexture) {
            if (destroyBase) {
                // delete the texture if it exists in the texture cache..
                // this only needs to be removed if the base texture is actually destroyed too..
                if (_utils.TextureCache[this.baseTexture.imageUrl]) {
                    delete _utils.TextureCache[this.baseTexture.imageUrl];
                }

                this.baseTexture.destroy();
            }

            this.baseTexture.off('update', this.onBaseTextureUpdated, this);
            this.baseTexture.off('loaded', this.onBaseTextureLoaded, this);

            this.baseTexture = null;
        }

        this._frame = null;
        this._uvs = null;
        this.trim = null;
        this.orig = null;

        this.valid = false;

        this.off('dispose', this.dispose, this);
        this.off('update', this.update, this);
    };

    /**
     * Creates a new texture object that acts the same as this one.
     *
     * @return {PIXI.Texture} The new texture
     */


    Texture.prototype.clone = function clone() {
        return new Texture(this.baseTexture, this.frame, this.orig, this.trim, this.rotate);
    };

    /**
     * Updates the internal WebGL UV cache.
     *
     * @protected
     */


    Texture.prototype._updateUvs = function _updateUvs() {
        if (!this._uvs) {
            this._uvs = new _TextureUvs2.default();
        }

        this._uvs.set(this._frame, this.baseTexture, this.rotate);

        this._updateID++;
    };

    /**
     * Helper function that creates a Texture object from the given image url.
     * If the image is not in the texture cache it will be  created and loaded.
     *
     * @static
     * @param {string} imageUrl - The image url of the texture
     * @param {boolean} [crossorigin] - Whether requests should be treated as crossorigin
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [sourceScale=(auto)] - Scale for the original image, used with SVG images.
     * @return {PIXI.Texture} The newly created texture
     */


    Texture.fromImage = function fromImage(imageUrl, crossorigin, scaleMode, sourceScale) {
        var texture = _utils.TextureCache[imageUrl];

        if (!texture) {
            texture = new Texture(_BaseTexture2.default.fromImage(imageUrl, crossorigin, scaleMode, sourceScale));
            _utils.TextureCache[imageUrl] = texture;
        }

        return texture;
    };

    /**
     * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
     * The frame ids are created when a Texture packer file has been loaded
     *
     * @static
     * @param {string} frameId - The frame Id of the texture in the cache
     * @return {PIXI.Texture} The newly created texture
     */


    Texture.fromFrame = function fromFrame(frameId) {
        var texture = _utils.TextureCache[frameId];

        if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
        }

        return texture;
    };

    /**
     * Helper function that creates a new Texture based on the given canvas element.
     *
     * @static
     * @param {HTMLCanvasElement} canvas - The canvas element source of the texture
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.Texture} The newly created texture
     */


    Texture.fromCanvas = function fromCanvas(canvas, scaleMode) {
        return new Texture(_BaseTexture2.default.fromCanvas(canvas, scaleMode));
    };

    /**
     * Helper function that creates a new Texture based on the given video element.
     *
     * @static
     * @param {HTMLVideoElement|string} video - The URL or actual element of the video
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.Texture} The newly created texture
     */


    Texture.fromVideo = function fromVideo(video, scaleMode) {
        if (typeof video === 'string') {
            return Texture.fromVideoUrl(video, scaleMode);
        }

        return new Texture(_VideoBaseTexture2.default.fromVideo(video, scaleMode));
    };

    /**
     * Helper function that creates a new Texture based on the video url.
     *
     * @static
     * @param {string} videoUrl - URL of the video
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.Texture} The newly created texture
     */


    Texture.fromVideoUrl = function fromVideoUrl(videoUrl, scaleMode) {
        return new Texture(_VideoBaseTexture2.default.fromUrl(videoUrl, scaleMode));
    };

    /**
     * Helper function that creates a new Texture based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @return {PIXI.Texture} The newly created texture
     */


    Texture.from = function from(source) {
        // TODO auto detect cross origin..
        // TODO pass in scale mode?
        if (typeof source === 'string') {
            var texture = _utils.TextureCache[source];

            if (!texture) {
                // check if its a video..
                var isVideo = source.match(/\.(mp4|webm|ogg|h264|avi|mov)$/) !== null;

                if (isVideo) {
                    return Texture.fromVideoUrl(source);
                }

                return Texture.fromImage(source);
            }

            return texture;
        } else if (source instanceof HTMLImageElement) {
            return new Texture(new _BaseTexture2.default(source));
        } else if (source instanceof HTMLCanvasElement) {
            return Texture.fromCanvas(source);
        } else if (source instanceof HTMLVideoElement) {
            return Texture.fromVideo(source);
        } else if (source instanceof _BaseTexture2.default) {
            return new Texture(source);
        }

        // lets assume its a texture!
        return source;
    };

    /**
     * Adds a texture to the global TextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.Texture} texture - The Texture to add to the cache.
     * @param {string} id - The id that the texture will be stored against.
     */


    Texture.addTextureToCache = function addTextureToCache(texture, id) {
        _utils.TextureCache[id] = texture;
    };

    /**
     * Remove a texture from the global TextureCache.
     *
     * @static
     * @param {string} id - The id of the texture to be removed
     * @return {PIXI.Texture} The texture that was removed
     */


    Texture.removeTextureFromCache = function removeTextureFromCache(id) {
        var texture = _utils.TextureCache[id];

        delete _utils.TextureCache[id];
        delete _utils.BaseTextureCache[id];

        return texture;
    };

    /**
     * The frame specifies the region of the base texture that this texture uses.
     *
     * @member {PIXI.Rectangle}
     * @memberof PIXI.Texture#
     */


    _createClass(Texture, [{
        key: 'frame',
        get: function get() {
            return this._frame;
        }

        /**
         * Set the frame.
         *
         * @param {Rectangle} frame - The new frame to set.
         */
        ,
        set: function set(frame) {
            this._frame = frame;

            this.noFrame = false;

            if (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height) {
                throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
            }

            // this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded;
            this.valid = frame && frame.width && frame.height && this.baseTexture.hasLoaded;

            if (!this.trim && !this.rotate) {
                this.orig = frame;
            }

            if (this.valid) {
                this._updateUvs();
            }
        }

        /**
         * Indicates whether the texture is rotated inside the atlas
         * set to 2 to compensate for texture packer rotation
         * set to 6 to compensate for spine packer rotation
         * can be used to rotate or mirror sprites
         * See {@link PIXI.GroupD8} for explanation
         *
         * @member {number}
         */

    }, {
        key: 'rotate',
        get: function get() {
            return this._rotate;
        }

        /**
         * Set the rotation
         *
         * @param {number} rotate - The new rotation to set.
         */
        ,
        set: function set(rotate) {
            this._rotate = rotate;
            if (this.valid) {
                this._updateUvs();
            }
        }

        /**
         * The width of the Texture in pixels.
         *
         * @member {number}
         */

    }, {
        key: 'width',
        get: function get() {
            return this.orig ? this.orig.width : 0;
        }

        /**
         * The height of the Texture in pixels.
         *
         * @member {number}
         */

    }, {
        key: 'height',
        get: function get() {
            return this.orig ? this.orig.height : 0;
        }
    }]);

    return Texture;
}(_eventemitter2.default);

/**
 * An empty texture, used often to not have to create multiple empty textures.
 * Can not be destroyed.
 *
 * @static
 * @constant
 */


exports.default = Texture;
Texture.EMPTY = new Texture(new _BaseTexture2.default());
Texture.EMPTY.destroy = function _emptyDestroy() {/* empty */};
Texture.EMPTY.on = function _emptyOn() {/* empty */};
Texture.EMPTY.once = function _emptyOnce() {/* empty */};
Texture.EMPTY.emit = function _emptyEmit() {/* empty */};
//# sourceMappingURL=Texture.js.map
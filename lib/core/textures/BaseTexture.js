'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

var _const = require('../const');

var _BufferResource = require('./resources/BufferResource');

var _BufferResource2 = _interopRequireDefault(_BufferResource);

var _createResource = require('./resources/createResource');

var _createResource2 = _interopRequireDefault(_createResource);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _bitTwiddle = require('bit-twiddle');

var _bitTwiddle2 = _interopRequireDefault(_bitTwiddle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseTexture = function (_EventEmitter) {
    _inherits(BaseTexture, _EventEmitter);

    function BaseTexture(resource) {
        var scaleMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _settings2.default.SCALE_MODE;
        var resolution = arguments[2];
        var width = arguments[3];
        var height = arguments[4];
        var format = arguments[5];
        var type = arguments[6];
        var mipmap = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : _settings2.default.MIPMAP_TEXTURES;

        _classCallCheck(this, BaseTexture);

        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        _this.uid = (0, _utils.uid)();

        _this.touched = 0;

        /**
         * The width of texture
         *
         * @member {Number}
         */
        _this.width = width || -1;
        /**
         * The height of texture
         *
         * @member {Number}
         */
        _this.height = height || -1;

        /**
         * The resolution / device pixel ratio of the texture
         *
         * @member {number}
         * @default 1
         */
        _this.resolution = resolution || _settings2.default.RESOLUTION;

        /**
         * Whether or not the texture is a power of two, try to use power of two textures as much
         * as you can
         *
         * @private
         * @member {boolean}
         */
        _this.isPowerOfTwo = false;

        /**
         * If mipmapping was used for this texture, enable and disable with enableMipmap()
         *
         * @member {Boolean}
         */
        //  TODO fix mipmapping..
        mipmap = false;
        _this.mipmap = mipmap;

        /**
         * Set to true to enable pre-multiplied alpha
         *
         * @member {Boolean}
         */
        _this.premultiplyAlpha = true;

        /**
         * [wrapMode description]
         * @type {number}
         */
        _this.wrapMode = _settings2.default.WRAP_MODE;

        /**
         * The scale mode to apply when scaling this texture
         *
         * @member {number}
         * @default PIXI.settings.SCALE_MODE
         * @see PIXI.SCALE_MODES
         */
        _this.scaleMode = scaleMode; // || settings.SCALE_MODE;

        /**
         * The pixel format of the texture. defaults to gl.RGBA
         *
         * @member {Number}
         */
        _this.format = format || _const.FORMATS.RGBA;
        _this.type = type || _const.TYPES.UNSIGNED_BYTE; // UNSIGNED_BYTE

        _this.target = _const.TARGETS.TEXTURE_2D; // gl.TEXTURE_2D

        _this._glTextures = {};

        _this._new = true;

        _this.dirtyId = 0;

        _this.valid = false;

        _this.resource = null;

        if (resource) {
            // lets convert this to a resource..
            resource = (0, _createResource2.default)(resource);
            _this.setResource(resource);
        }

        _this.cacheId = null;

        _this.validate();

        _this.textureCacheIds = [];

        /**
         * Fired when a not-immediately-available source finishes loading.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when a not-immediately-available source fails to load.
         *
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
         */

        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when BaseTexture is destroyed.
         *
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
         */

        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#update
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being updated.
         */

        /**
         * Fired when BaseTexture is destroyed.
         *
         * @protected
         * @event PIXI.BaseTexture#dispose
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being destroyed.
         */
        return _this;
    }

    BaseTexture.prototype.updateResolution = function updateResolution() {
        var resource = this.resource;

        if (resource && resource.width !== -1 && resource.hight !== -1) {
            this.width = resource.width / this.resolution;
            this.height = resource.height / this.resolution;
        }
    };

    BaseTexture.prototype.setResource = function setResource(resource) {
        // TODO currently a resource can only be set once..

        if (this.resource) {
            this.resource.resourceUpdated.remove(this);
        }

        this.resource = resource;

        resource.resourceUpdated.add(this); // calls resourceUpaded

        if (resource.loaded) {
            this.resourceLoaded(resource);
        }

        resource.load.then(this.resourceLoaded.bind(this)).catch(function (reason) {
            // failed to load - maybe resource was destroyed before it loaded.
            console.warn(reason);
        });
    };

    BaseTexture.prototype.resourceLoaded = function resourceLoaded(resource) {
        if (this.resource === resource) {
            this.updateResolution();

            this.validate();

            if (this.valid) {
                this.isPowerOfTwo = _bitTwiddle2.default.isPow2(this.realWidth) && _bitTwiddle2.default.isPow2(this.realHeight);

                // we have not swapped half way!
                this.dirtyId++;

                this.emit('loaded', this);
            }
        }
    };

    BaseTexture.prototype.resourceUpdated = function resourceUpdated() {
        // the resource was updated..
        this.dirtyId++;
    };

    BaseTexture.prototype.update = function update() {
        this.dirtyId++;
    };

    BaseTexture.prototype.resize = function resize(width, height) {
        this.width = width;
        this.height = height;

        this.dirtyId++;
    };

    BaseTexture.prototype.validate = function validate() {
        var valid = true;

        if (this.width === -1 || this.height === -1) {
            valid = false;
        }

        this.valid = valid;
    };

    /**
     * Destroys this base texture
     *
     */
    BaseTexture.prototype.destroy = function destroy() {
        if (this.cacheId) {
            delete _utils.BaseTextureCache[this.cacheId];
            delete _utils.TextureCache[this.cacheId];

            this.cacheId = null;
        }

        // remove and destroy the resource

        if (this.resource) {
            this.resource.destroy();
            this.resource = null;
        }

        // finally let the webGL renderer know..
        this.dispose();

        BaseTexture.removeFromCache(this);
        this.textureCacheIds = null;
    };

    /**
     * Frees the texture from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */


    BaseTexture.prototype.dispose = function dispose() {
        this.emit('dispose', this);
    };

    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element.
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement} source - The source to create base texture from.
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [sourceScale=(auto)] - Scale for the original image, used with Svg images.
     * @return {PIXI.BaseTexture} The new base texture.
     */


    BaseTexture.from = function from(source, scaleMode) {
        var cacheId = null;

        if (typeof source === 'string') {
            cacheId = source;
        } else {
            if (!source._pixiId) {
                source._pixiId = 'pixiid_' + (0, _utils.uid)();
            }

            cacheId = source._pixiId;
        }

        var baseTexture = _utils.BaseTextureCache[cacheId];

        if (!baseTexture) {
            baseTexture = new BaseTexture(source, scaleMode);
            baseTexture.cacheId = cacheId;
            BaseTexture.addToCache(baseTexture, cacheId);
        }

        return baseTexture;
    };

    BaseTexture.fromFloat32Array = function fromFloat32Array(width, height, float32Array) {
        float32Array = float32Array || new Float32Array(width * height * 4);

        var texture = new BaseTexture(new _BufferResource2.default(float32Array), _const.SCALE_MODES.NEAREST, 1, width, height, _const.FORMATS.RGBA, _const.TYPES.FLOAT);

        return texture;
    };

    BaseTexture.fromUint8Array = function fromUint8Array(width, height, uint8Array) {
        uint8Array = uint8Array || new Uint8Array(width * height * 4);

        var texture = new BaseTexture(new _BufferResource2.default(uint8Array), _const.SCALE_MODES.NEAREST, 1, width, height, _const.FORMATS.RGBA, _const.TYPES.UNSIGNED_BYTE);

        return texture;
    };

    /**
     * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
     * @param {string} id - The id that the BaseTexture will be stored against.
     */


    BaseTexture.addToCache = function addToCache(baseTexture, id) {
        if (id) {
            if (baseTexture.textureCacheIds.indexOf(id) === -1) {
                baseTexture.textureCacheIds.push(id);
            }

            // @if DEBUG
            /* eslint-disable no-console */
            if (_utils.BaseTextureCache[id]) {
                console.warn('BaseTexture added to the cache with an id [' + id + '] that already had an entry');
            }
            /* eslint-enable no-console */
            // @endif

            _utils.BaseTextureCache[id] = baseTexture;
        }
    };

    /**
     * Remove a BaseTexture from the global BaseTextureCache.
     *
     * @static
     * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
     * @return {PIXI.BaseTexture|null} The BaseTexture that was removed.
     */


    BaseTexture.removeFromCache = function removeFromCache(baseTexture) {
        if (typeof baseTexture === 'string') {
            var baseTextureFromCache = _utils.BaseTextureCache[baseTexture];

            if (baseTextureFromCache) {
                var index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);

                if (index > -1) {
                    baseTextureFromCache.textureCacheIds.splice(index, 1);
                }

                delete _utils.BaseTextureCache[baseTexture];

                return baseTextureFromCache;
            }
        } else {
            for (var i = 0; i < baseTexture.textureCacheIds.length; ++i) {
                delete _utils.BaseTextureCache[baseTexture.textureCacheIds[i]];
            }

            baseTexture.textureCacheIds.length = 0;

            return baseTexture;
        }

        return null;
    };

    _createClass(BaseTexture, [{
        key: 'realWidth',
        get: function get() {
            return this.width * this.resolution;
        }
    }, {
        key: 'realHeight',
        get: function get() {
            return this.height * this.resolution;
        }
    }]);

    return BaseTexture;
}(_eventemitter2.default);

exports.default = BaseTexture;


BaseTexture.fromFrame = BaseTexture.fromFrame;
BaseTexture.fromImage = BaseTexture.from;
BaseTexture.fromSVG = BaseTexture.from;
BaseTexture.fromCanvas = BaseTexture.from;
//# sourceMappingURL=BaseTexture.js.map
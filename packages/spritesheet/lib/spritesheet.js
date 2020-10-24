/*!
 * @pixi/spritesheet - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/spritesheet is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var math = require('@pixi/math');
var core = require('@pixi/core');
var utils = require('@pixi/utils');
var loaders = require('@pixi/loaders');

/**
 * Utility class for maintaining reference to a collection
 * of Textures on a single Spritesheet.
 *
 * To access a sprite sheet from your code pass its JSON data file to Pixi's loader:
 *
 * ```js
 * PIXI.Loader.shared.add("images/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["images/spritesheet.json"].spritesheet;
 *   ...
 * }
 * ```
 * With the `sheet.textures` you can create Sprite objects,`sheet.animations` can be used to create an AnimatedSprite.
 *
 * Sprite sheets can be packed using tools like {@link https://codeandweb.com/texturepacker|TexturePacker},
 * {@link https://renderhjs.net/shoebox/|Shoebox} or {@link https://github.com/krzysztof-o/spritesheet.js|Spritesheet.js}.
 * Default anchor points (see {@link PIXI.Texture#defaultAnchor}) and grouping of animation sprites are currently only
 * supported by TexturePacker.
 *
 * @class
 * @memberof PIXI
 */
var Spritesheet = /** @class */ (function () {
    /**
     * @param {PIXI.BaseTexture|PIXI.Texture} baseTexture - Reference to the source BaseTexture object.
     * @param {Object} data - Spritesheet image data.
     * @param {string} [resolutionFilename] - The filename to consider when determining
     *        the resolution of the spritesheet. If not provided, the imageUrl will
     *        be used on the BaseTexture.
     */
    function Spritesheet(texture, data, resolutionFilename) {
        if (resolutionFilename === void 0) { resolutionFilename = null; }
        /**
         * Reference to original source image from the Loader. This reference is retained so we
         * can destroy the Texture later on. It is never used internally.
         * @type {PIXI.Texture}
         * @private
         */
        this._texture = texture instanceof core.Texture ? texture : null;
        /**
         * Reference to ths source texture.
         * @type {PIXI.BaseTexture}
         */
        this.baseTexture = texture instanceof core.BaseTexture ? texture : this._texture.baseTexture;
        /**
         * A map containing all textures of the sprite sheet.
         * Can be used to create a {@link PIXI.Sprite|Sprite}:
         * ```js
         * new PIXI.Sprite(sheet.textures["image.png"]);
         * ```
         * @member {Object}
         */
        this.textures = {};
        /**
         * A map containing the textures for each animation.
         * Can be used to create an {@link PIXI.AnimatedSprite|AnimatedSprite}:
         * ```js
         * new PIXI.AnimatedSprite(sheet.animations["anim_name"])
         * ```
         * @member {Object}
         */
        this.animations = {};
        /**
         * Reference to the original JSON data.
         * @type {Object}
         */
        this.data = data;
        var resource = this.baseTexture.resource;
        /**
         * The resolution of the spritesheet.
         * @type {number}
         */
        this.resolution = this._updateResolution(resolutionFilename || (resource ? resource.url : null));
        /**
         * Map of spritesheet frames.
         * @type {Object}
         * @private
         */
        this._frames = this.data.frames;
        /**
         * Collection of frame names.
         * @type {string[]}
         * @private
         */
        this._frameKeys = Object.keys(this._frames);
        /**
         * Current batch index being processed.
         * @type {number}
         * @private
         */
        this._batchIndex = 0;
        /**
         * Callback when parse is completed.
         * @type {Function}
         * @private
         */
        this._callback = null;
    }
    /**
     * Generate the resolution from the filename or fallback
     * to the meta.scale field of the JSON data.
     *
     * @private
     * @param {string} resolutionFilename - The filename to use for resolving
     *        the default resolution.
     * @return {number} Resolution to use for spritesheet.
     */
    Spritesheet.prototype._updateResolution = function (resolutionFilename) {
        if (resolutionFilename === void 0) { resolutionFilename = null; }
        var scale = this.data.meta.scale;
        // Use a defaultValue of `null` to check if a url-based resolution is set
        var resolution = utils.getResolutionOfUrl(resolutionFilename, null);
        // No resolution found via URL
        if (resolution === null) {
            // Use the scale value or default to 1
            resolution = scale !== undefined ? parseFloat(scale) : 1;
        }
        // For non-1 resolutions, update baseTexture
        if (resolution !== 1) {
            this.baseTexture.setResolution(resolution);
        }
        return resolution;
    };
    /**
     * Parser spritesheet from loaded data. This is done asynchronously
     * to prevent creating too many Texture within a single process.
     *
     * @param {Function} callback - Callback when complete returns
     *        a map of the Textures for this spritesheet.
     */
    Spritesheet.prototype.parse = function (callback) {
        this._batchIndex = 0;
        this._callback = callback;
        if (this._frameKeys.length <= Spritesheet.BATCH_SIZE) {
            this._processFrames(0);
            this._processAnimations();
            this._parseComplete();
        }
        else {
            this._nextBatch();
        }
    };
    /**
     * Process a batch of frames
     *
     * @private
     * @param {number} initialFrameIndex - The index of frame to start.
     */
    Spritesheet.prototype._processFrames = function (initialFrameIndex) {
        var frameIndex = initialFrameIndex;
        var maxFrames = Spritesheet.BATCH_SIZE;
        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length) {
            var i = this._frameKeys[frameIndex];
            var data = this._frames[i];
            var rect = data.frame;
            if (rect) {
                var frame = null;
                var trim = null;
                var sourceSize = data.trimmed !== false && data.sourceSize
                    ? data.sourceSize : data.frame;
                var orig = new math.Rectangle(0, 0, Math.floor(sourceSize.w) / this.resolution, Math.floor(sourceSize.h) / this.resolution);
                if (data.rotated) {
                    frame = new math.Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.h) / this.resolution, Math.floor(rect.w) / this.resolution);
                }
                else {
                    frame = new math.Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
                }
                //  Check to see if the sprite is trimmed
                if (data.trimmed !== false && data.spriteSourceSize) {
                    trim = new math.Rectangle(Math.floor(data.spriteSourceSize.x) / this.resolution, Math.floor(data.spriteSourceSize.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
                }
                this.textures[i] = new core.Texture(this.baseTexture, frame, orig, trim, data.rotated ? 2 : 0, data.anchor);
                // lets also add the frame to pixi's global cache for 'from' and 'fromLoader' functions
                core.Texture.addToCache(this.textures[i], i);
            }
            frameIndex++;
        }
    };
    /**
     * Parse animations config
     *
     * @private
     */
    Spritesheet.prototype._processAnimations = function () {
        var animations = this.data.animations || {};
        for (var animName in animations) {
            this.animations[animName] = [];
            for (var i = 0; i < animations[animName].length; i++) {
                var frameName = animations[animName][i];
                this.animations[animName].push(this.textures[frameName]);
            }
        }
    };
    /**
     * The parse has completed.
     *
     * @private
     */
    Spritesheet.prototype._parseComplete = function () {
        var callback = this._callback;
        this._callback = null;
        this._batchIndex = 0;
        callback.call(this, this.textures);
    };
    /**
     * Begin the next batch of textures.
     *
     * @private
     */
    Spritesheet.prototype._nextBatch = function () {
        var _this = this;
        this._processFrames(this._batchIndex * Spritesheet.BATCH_SIZE);
        this._batchIndex++;
        setTimeout(function () {
            if (_this._batchIndex * Spritesheet.BATCH_SIZE < _this._frameKeys.length) {
                _this._nextBatch();
            }
            else {
                _this._processAnimations();
                _this._parseComplete();
            }
        }, 0);
    };
    /**
     * Destroy Spritesheet and don't use after this.
     *
     * @param {boolean} [destroyBase=false] - Whether to destroy the base texture as well
     */
    Spritesheet.prototype.destroy = function (destroyBase) {
        var _a;
        if (destroyBase === void 0) { destroyBase = false; }
        for (var i in this.textures) {
            this.textures[i].destroy();
        }
        this._frames = null;
        this._frameKeys = null;
        this.data = null;
        this.textures = null;
        if (destroyBase) {
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.destroy();
            this.baseTexture.destroy();
        }
        this._texture = null;
        this.baseTexture = null;
    };
    /**
     * The maximum number of Textures to build per process.
     *
     * @type {number}
     * @default 1000
     */
    Spritesheet.BATCH_SIZE = 1000;
    return Spritesheet;
}());

/**
 * {@link PIXI.Loader} middleware for loading texture atlases that have been created with
 * TexturePacker or similar JSON-based spritesheet.
 *
 * This middleware automatically generates Texture resources.
 *
 * If you're using Webpack or other bundlers and plan on bundling the atlas' JSON,
 * use the {@link PIXI.Spritesheet} class to directly parse the JSON.
 *
 * The Loader's image Resource name is automatically appended with `"_image"`.
 * If a Resource with this name is already loaded, the Loader will skip parsing the
 * Spritesheet. The code below will generate an internal Loader Resource called `"myatlas_image"`.
 *
 * @example
 * loader.add('myatlas', 'path/to/myatlas.json');
 * loader.load(() => {
 *   loader.resources.myatlas; // atlas JSON resource
 *   loader.resources.myatlas_image; // atlas Image resource
 * });
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
var SpritesheetLoader = /** @class */ (function () {
    function SpritesheetLoader() {
    }
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    SpritesheetLoader.use = function (resource, next) {
        var _a, _b;
        // because this is middleware, it execute in loader context. `this` = loader
        var loader = this;
        var imageResourceName = resource.name + "_image";
        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data
            || resource.type !== loaders.LoaderResource.TYPE.JSON
            || !resource.data.frames
            || loader.resources[imageResourceName]) {
            next();
            return;
        }
        // Check and add the multi atlas
        // Heavily influenced and based on https://github.com/rocket-ua/pixi-tps-loader/blob/master/src/ResourceLoader.js
        // eslint-disable-next-line camelcase
        var multiPacks = (_b = (_a = resource.data) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.related_multi_packs;
        if (Array.isArray(multiPacks)) {
            var _loop_1 = function (item) {
                if (typeof item !== 'string') {
                    return "continue";
                }
                var itemName = item.replace('.json', '');
                var itemUrl = utils.url.resolve(resource.url.replace(loader.baseUrl, ''), item);
                // Check if the file wasn't already added as multipacks are redundant
                if (loader.resources[itemName]
                    || Object.values(loader.resources).some(function (r) { return utils.url.format(utils.url.parse(r.url)) === itemUrl; })) {
                    return "continue";
                }
                var options = {
                    crossOrigin: resource.crossOrigin,
                    loadType: loaders.LoaderResource.LOAD_TYPE.XHR,
                    xhrType: loaders.LoaderResource.XHR_RESPONSE_TYPE.JSON,
                    parentResource: resource,
                };
                loader.add(itemName, itemUrl, options);
            };
            for (var _i = 0, multiPacks_1 = multiPacks; _i < multiPacks_1.length; _i++) {
                var item = multiPacks_1[_i];
                _loop_1(item);
            }
        }
        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            metadata: resource.metadata.imageMetadata,
            parentResource: resource,
        };
        var resourcePath = SpritesheetLoader.getResourcePath(resource, loader.baseUrl);
        // load the image for this sheet
        loader.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res) {
            if (res.error) {
                next(res.error);
                return;
            }
            var spritesheet = new Spritesheet(res.texture, resource.data, resource.url);
            spritesheet.parse(function () {
                resource.spritesheet = spritesheet;
                resource.textures = spritesheet.textures;
                next();
            });
        });
    };
    /**
     * Get the spritesheets root path
     * @param {PIXI.LoaderResource} resource - Resource to check path
     * @param {string} baseUrl - Base root url
     */
    SpritesheetLoader.getResourcePath = function (resource, baseUrl) {
        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl) {
            return resource.data.meta.image;
        }
        return utils.url.resolve(resource.url.replace(baseUrl, ''), resource.data.meta.image);
    };
    return SpritesheetLoader;
}());

exports.Spritesheet = Spritesheet;
exports.SpritesheetLoader = SpritesheetLoader;
//# sourceMappingURL=spritesheet.js.map

'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ = require('../');

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utility class for maintaining reference to a collection
 * of Textures on a single Spritesheet.
 *
 * @class
 * @memberof PIXI
 */
var Spritesheet = function () {
    _createClass(Spritesheet, null, [{
        key: 'BATCH_SIZE',

        /**
         * The maximum number of Textures to build per process.
         *
         * @type {number}
         * @default 1000
         */
        get: function get() {
            return 1000;
        }

        /**
         * @param {PIXI.BaseTexture} baseTexture Reference to the source BaseTexture object.
         * @param {Object} data - Spritesheet image data.
         * @param {string} [resolutionFilename] - The filename to consider when determining
         *        the resolution of the spritesheet. If not provided, the imageUrl will
         *        be used on the BaseTexture.
         */

    }]);

    function Spritesheet(baseTexture, data) {
        var resolutionFilename = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, Spritesheet);

        /**
         * Reference to ths source texture
         * @type {PIXI.BaseTexture}
         */
        this.baseTexture = baseTexture;

        /**
         * Map of spritesheet textures.
         * @type {Object}
         */
        this.textures = {};

        /**
         * Reference to the original JSON data.
         * @type {Object}
         */
        this.data = data;

        /**
         * The resolution of the spritesheet.
         * @type {number}
         */
        this.resolution = this._updateResolution(resolutionFilename || this.baseTexture.imageUrl);

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


    Spritesheet.prototype._updateResolution = function _updateResolution(resolutionFilename) {
        var scale = this.data.meta.scale;

        // Use a defaultValue of `null` to check if a url-based resolution is set
        var resolution = (0, _utils.getResolutionOfUrl)(resolutionFilename, null);

        // No resolution found via URL
        if (resolution === null) {
            // Use the scale value or default to 1
            resolution = scale !== undefined ? parseFloat(scale) : 1;
        }

        // For non-1 resolutions, update baseTexture
        if (resolution !== 1) {
            this.baseTexture.resolution = resolution;
            this.baseTexture.update();
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


    Spritesheet.prototype.parse = function parse(callback) {
        this._batchIndex = 0;
        this._callback = callback;

        if (this._frameKeys.length <= Spritesheet.BATCH_SIZE) {
            this._processFrames(0);
            this._parseComplete();
        } else {
            this._nextBatch();
        }
    };

    /**
     * Process a batch of frames
     *
     * @private
     * @param {number} initialFrameIndex - The index of frame to start.
     */


    Spritesheet.prototype._processFrames = function _processFrames(initialFrameIndex) {
        var frameIndex = initialFrameIndex;
        var maxFrames = Spritesheet.BATCH_SIZE;

        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length) {
            var i = this._frameKeys[frameIndex];
            var rect = this._frames[i].frame;

            if (rect) {
                var frame = null;
                var trim = null;
                var orig = new _.Rectangle(0, 0, this._frames[i].sourceSize.w / this.resolution, this._frames[i].sourceSize.h / this.resolution);

                if (this._frames[i].rotated) {
                    frame = new _.Rectangle(rect.x / this.resolution, rect.y / this.resolution, rect.h / this.resolution, rect.w / this.resolution);
                } else {
                    frame = new _.Rectangle(rect.x / this.resolution, rect.y / this.resolution, rect.w / this.resolution, rect.h / this.resolution);
                }

                //  Check to see if the sprite is trimmed
                if (this._frames[i].trimmed) {
                    trim = new _.Rectangle(this._frames[i].spriteSourceSize.x / this.resolution, this._frames[i].spriteSourceSize.y / this.resolution, rect.w / this.resolution, rect.h / this.resolution);
                }

                this.textures[i] = new _.Texture(this.baseTexture, frame, orig, trim, this._frames[i].rotated ? 2 : 0);

                // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                _.Texture.addToCache(this.textures[i], i);
            }

            frameIndex++;
        }
    };

    /**
     * The parse has completed.
     *
     * @private
     */


    Spritesheet.prototype._parseComplete = function _parseComplete() {
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


    Spritesheet.prototype._nextBatch = function _nextBatch() {
        var _this = this;

        this._processFrames(this._batchIndex * Spritesheet.BATCH_SIZE);
        this._batchIndex++;
        setTimeout(function () {
            if (_this._batchIndex * Spritesheet.BATCH_SIZE < _this._frameKeys.length) {
                _this._nextBatch();
            } else {
                _this._parseComplete();
            }
        }, 0);
    };

    /**
     * Destroy Spritesheet and don't use after this.
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
     */


    Spritesheet.prototype.destroy = function destroy() {
        var destroyBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        for (var i in this.textures) {
            this.textures[i].destroy();
        }
        this._frames = null;
        this._frameKeys = null;
        this.data = null;
        this.textures = null;
        if (destroyBase) {
            this.baseTexture.destroy();
        }
        this.baseTexture = null;
    };

    return Spritesheet;
}();

exports.default = Spritesheet;
//# sourceMappingURL=Spritesheet.js.map
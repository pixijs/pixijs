'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseTexture2 = require('./BaseTexture');

var _BaseTexture3 = _interopRequireDefault(_BaseTexture2);

var _utils = require('../utils');

var _ticker = require('../ticker');

var ticker = _interopRequireWildcard(_ticker);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A texture of a [playing] Video.
 *
 * Video base textures mimic Pixi BaseTexture.from.... method in their creation process.
 *
 * This can be used in several ways, such as:
 *
 * ```js
 * let texture = PIXI.VideoBaseTexture.fromUrl('http://mydomain.com/video.mp4');
 *
 * let texture = PIXI.VideoBaseTexture.fromUrl({ src: 'http://mydomain.com/video.mp4', mime: 'video/mp4' });
 *
 * let texture = PIXI.VideoBaseTexture.fromUrls(['/video.webm', '/video.mp4']);
 *
 * let texture = PIXI.VideoBaseTexture.fromUrls([
 *     { src: '/video.webm', mime: 'video/webm' },
 *     { src: '/video.mp4', mime: 'video/mp4' }
 * ]);
 * ```
 *
 * See the ["deus" demo](http://www.goodboydigital.com/pixijs/examples/deus/).
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 */
var VideoBaseTexture = function (_BaseTexture) {
    _inherits(VideoBaseTexture, _BaseTexture);

    /**
     * @param {HTMLVideoElement} source - Video source
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     */
    function VideoBaseTexture(source, scaleMode) {
        _classCallCheck(this, VideoBaseTexture);

        if (!source) {
            throw new Error('No video source element specified.');
        }

        // hook in here to check if video is already available.
        // BaseTexture looks for a source.complete boolean, plus width & height.

        if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
            source.complete = true;
        }

        var _this = _possibleConstructorReturn(this, _BaseTexture.call(this, source, scaleMode));

        _this.width = source.videoWidth;
        _this.height = source.videoHeight;

        _this._autoUpdate = true;
        _this._isAutoUpdating = false;

        /**
         * When set to true will automatically play videos used by this texture once
         * they are loaded. If false, it will not modify the playing state.
         *
         * @member {boolean}
         * @default true
         */
        _this.autoPlay = true;

        _this.update = _this.update.bind(_this);
        _this._onCanPlay = _this._onCanPlay.bind(_this);

        source.addEventListener('play', _this._onPlayStart.bind(_this));
        source.addEventListener('pause', _this._onPlayStop.bind(_this));
        _this.hasLoaded = false;
        _this.__loaded = false;

        if (!_this._isSourceReady()) {
            source.addEventListener('canplay', _this._onCanPlay);
            source.addEventListener('canplaythrough', _this._onCanPlay);
        } else {
            _this._onCanPlay();
        }
        return _this;
    }

    /**
     * Returns true if the underlying source is playing.
     *
     * @private
     * @return {boolean} True if playing.
     */


    VideoBaseTexture.prototype._isSourcePlaying = function _isSourcePlaying() {
        var source = this.source;

        return source.currentTime > 0 && source.paused === false && source.ended === false && source.readyState > 2;
    };

    /**
     * Returns true if the underlying source is ready for playing.
     *
     * @private
     * @return {boolean} True if ready.
     */


    VideoBaseTexture.prototype._isSourceReady = function _isSourceReady() {
        return this.source.readyState === 3 || this.source.readyState === 4;
    };

    /**
     * Runs the update loop when the video is ready to play
     *
     * @private
     */


    VideoBaseTexture.prototype._onPlayStart = function _onPlayStart() {
        // Just in case the video has not received its can play even yet..
        if (!this.hasLoaded) {
            this._onCanPlay();
        }

        if (!this._isAutoUpdating && this.autoUpdate) {
            ticker.shared.add(this.update, this);
            this._isAutoUpdating = true;
        }
    };

    /**
     * Fired when a pause event is triggered, stops the update loop
     *
     * @private
     */


    VideoBaseTexture.prototype._onPlayStop = function _onPlayStop() {
        if (this._isAutoUpdating) {
            ticker.shared.remove(this.update, this);
            this._isAutoUpdating = false;
        }
    };

    /**
     * Fired when the video is loaded and ready to play
     *
     * @private
     */


    VideoBaseTexture.prototype._onCanPlay = function _onCanPlay() {
        this.hasLoaded = true;

        if (this.source) {
            this.source.removeEventListener('canplay', this._onCanPlay);
            this.source.removeEventListener('canplaythrough', this._onCanPlay);

            this.width = this.source.videoWidth;
            this.height = this.source.videoHeight;

            // prevent multiple loaded dispatches..
            if (!this.__loaded) {
                this.__loaded = true;
                this.emit('loaded', this);
            }

            if (this._isSourcePlaying()) {
                this._onPlayStart();
            } else if (this.autoPlay) {
                this.source.play();
            }
        }
    };

    /**
     * Destroys this texture
     *
     */


    VideoBaseTexture.prototype.destroy = function destroy() {
        if (this._isAutoUpdating) {
            ticker.shared.remove(this.update, this);
        }

        if (this.source && this.source._pixiId) {
            delete _utils.BaseTextureCache[this.source._pixiId];
            delete this.source._pixiId;
        }

        _BaseTexture.prototype.destroy.call(this);
    };

    /**
     * Mimic Pixi BaseTexture.from.... method.
     *
     * @static
     * @param {HTMLVideoElement} video - Video to create texture from
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.VideoBaseTexture} Newly created VideoBaseTexture
     */


    VideoBaseTexture.fromVideo = function fromVideo(video, scaleMode) {
        if (!video._pixiId) {
            video._pixiId = 'video_' + (0, _utils.uid)();
        }

        var baseTexture = _utils.BaseTextureCache[video._pixiId];

        if (!baseTexture) {
            baseTexture = new VideoBaseTexture(video, scaleMode);
            _utils.BaseTextureCache[video._pixiId] = baseTexture;
        }

        return baseTexture;
    };

    /**
     * Helper function that creates a new BaseTexture based on the given video element.
     * This BaseTexture can then be used to create a texture
     *
     * @static
     * @param {string|object|string[]|object[]} videoSrc - The URL(s) for the video.
     * @param {string} [videoSrc.src] - One of the source urls for the video
     * @param {string} [videoSrc.mime] - The mimetype of the video (e.g. 'video/mp4'). If not specified
     *  the url's extension will be used as the second part of the mime type.
     * @param {number} scaleMode - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.VideoBaseTexture} Newly created VideoBaseTexture
     */


    VideoBaseTexture.fromUrl = function fromUrl(videoSrc, scaleMode) {
        var video = document.createElement('video');

        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('playsinline', '');

        // array of objects or strings
        if (Array.isArray(videoSrc)) {
            for (var i = 0; i < videoSrc.length; ++i) {
                video.appendChild(createSource(videoSrc[i].src || videoSrc[i], videoSrc[i].mime));
            }
        }
        // single object or string
        else {
                video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
            }

        video.load();

        return VideoBaseTexture.fromVideo(video, scaleMode);
    };

    /**
     * Should the base texture automatically update itself, set to true by default
     *
     * @member {boolean}
     * @memberof PIXI.VideoBaseTexture#
     */


    _createClass(VideoBaseTexture, [{
        key: 'autoUpdate',
        get: function get() {
            return this._autoUpdate;
        }

        /**
         * Sets autoUpdate property.
         *
         * @param {number} value - enable auto update or not
         */
        ,
        set: function set(value) {
            if (value !== this._autoUpdate) {
                this._autoUpdate = value;

                if (!this._autoUpdate && this._isAutoUpdating) {
                    ticker.shared.remove(this.update, this);
                    this._isAutoUpdating = false;
                } else if (this._autoUpdate && !this._isAutoUpdating) {
                    ticker.shared.add(this.update, this);
                    this._isAutoUpdating = true;
                }
            }
        }
    }]);

    return VideoBaseTexture;
}(_BaseTexture3.default);

exports.default = VideoBaseTexture;


VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;

function createSource(path, type) {
    if (!type) {
        type = 'video/' + path.substr(path.lastIndexOf('.') + 1);
    }

    var source = document.createElement('source');

    source.src = path;
    source.type = type;

    return source;
}
//# sourceMappingURL=VideoBaseTexture.js.map
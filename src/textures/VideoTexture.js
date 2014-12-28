var BaseTexture = require('./BaseTexture'),
    Texture = require('./Texture'),
    utils = require('../utils');

/**
 * A texture of a [playing] Video.
 *
 * See the ["deus" demo](http://www.goodboydigital.com/pixijs/examples/deus/).
 *
 * @class
 * @extends BaseTexture
 * @namespace PIXI
 * @param source {HTMLVideoElement}
 * @param [scaleMode] {number} See {@link scaleModes} for possible values
 */
function VideoTexture(source, scaleMode) {
    if (!source){
        throw new Error('No video source element specified.');
    }

    // hook in here to check if video is already available.
    // BaseTexture looks for a source.complete boolean, plus width & height.

    if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
        source.complete = true;
    }

    BaseTexture.call(this, source, scaleMode);

    this.autoUpdate = false;
    this.updateBound = this._onUpdate.bind(this);

    if (!source.complete) {
        this._onCanPlay = this.onCanPlay.bind(this);

        source.addEventListener('canplay', this._onCanPlay);
        source.addEventListener('canplaythrough', this._onCanPlay);

        // started playing..
        source.addEventListener('play', this.onPlayStart.bind(this));
        source.addEventListener('pause', this.onPlayStop.bind(this));
    }
}

VideoTexture.prototype = Object.create(BaseTexture.prototype);
VideoTexture.prototype.constructor = VideoTexture;
module.exports = VideoTexture;

VideoTexture.prototype._onUpdate = function () {
    if (this.autoUpdate) {
        window.requestAnimationFrame(this.updateBound);
        this.dirty();
    }
};

VideoTexture.prototype.onPlayStart = function () {
    if (!this.autoUpdate) {
        window.requestAnimationFrame(this.updateBound);
        this.autoUpdate = true;
    }
};

VideoTexture.prototype.onPlayStop = function () {
    this.autoUpdate = false;
};

VideoTexture.prototype.onCanPlay = function () {
    if (event.type === 'canplaythrough') {
        this.hasLoaded  = true;


        if (this.source) {
            this.source.removeEventListener('canplay', this._onCanPlay);
            this.source.removeEventListener('canplaythrough', this._onCanPlay);

            this.width      = this.source.videoWidth;
            this.height     = this.source.videoHeight;

            // prevent multiple loaded dispatches..
            if (!this.__loaded){
                this.__loaded = true;
                this.dispatchEvent({ type: 'loaded', content: this });
            }
        }
    }
};

VideoTexture.prototype.destroy = function () {
    if (this.source && this.source._pixiId) {
        utils.BaseTextureCache[ this.source._pixiId ] = null;
        delete utils.BaseTextureCache[ this.source._pixiId ];

        this.source._pixiId = null;
        delete this.source._pixiId;
    }

    BaseTexture.prototype.destroy.call(this);
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param video {HTMLVideoElement}
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return {VideoTexture}
 */
VideoTexture.baseTextureFromVideo = function (video, scaleMode) {
    if (!video._pixiId) {
        video._pixiId = 'video_' + utils.TextureCacheIdGenerator++;
    }

    var baseTexture = utils.BaseTextureCache[ video._pixiId ];

    if (!baseTexture) {
        baseTexture = new VideoTexture(video, scaleMode);
        utils.BaseTextureCache[ video._pixiId ] = baseTexture;
    }

    return baseTexture;
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param video {HTMLVideoElement}
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return {Texture} A Texture, but not a VideoTexture.
 */
VideoTexture.textureFromVideo = function (video, scaleMode) {
    var baseTexture = VideoTexture.baseTextureFromVideo(video, scaleMode);
    return new Texture(baseTexture);
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param videoSrc {string} The URL for the video.
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return {VideoTexture}
 */
VideoTexture.fromUrl = function (videoSrc, scaleMode) {
    var video = document.createElement('video');
    video.src = videoSrc;
    video.autoPlay = true;
    video.play();
    return VideoTexture.textureFromVideo(video, scaleMode);
};

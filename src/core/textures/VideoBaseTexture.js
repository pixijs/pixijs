import BaseTexture from './BaseTexture';
import { uid, BaseTextureCache } from '../utils';
import { shared } from '../ticker';
import { UPDATE_PRIORITY } from '../const';

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
export default class VideoBaseTexture extends BaseTexture
{
    /**
     * @param {HTMLVideoElement} source - Video source
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     */
    constructor(source, scaleMode)
    {
        if (!source)
        {
            throw new Error('No video source element specified.');
        }

        // hook in here to check if video is already available.
        // BaseTexture looks for a source.complete boolean, plus width & height.

        if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA)
            && source.width && source.height)
        {
            source.complete = true;
        }

        super(source, scaleMode);

        this.width = source.videoWidth;
        this.height = source.videoHeight;

        this._autoUpdate = true;
        this._isAutoUpdating = false;

        /**
         * When set to true will automatically play videos used by this texture once
         * they are loaded. If false, it will not modify the playing state.
         *
         * @member {boolean}
         * @default true
         */
        this.autoPlay = true;

        this.update = this.update.bind(this);
        this._onCanPlay = this._onCanPlay.bind(this);

        source.addEventListener('play', this._onPlayStart.bind(this));
        source.addEventListener('pause', this._onPlayStop.bind(this));
        this.hasLoaded = false;
        this.__loaded = false;

        if (!this._isSourceReady())
        {
            source.addEventListener('canplay', this._onCanPlay);
            source.addEventListener('canplaythrough', this._onCanPlay);
        }
        else
        {
            this._onCanPlay();
        }
    }

    /**
     * Returns true if the underlying source is playing.
     *
     * @private
     * @return {boolean} True if playing.
     */
    _isSourcePlaying()
    {
        const source = this.source;

        return (source.currentTime > 0 && source.paused === false && source.ended === false && source.readyState > 2);
    }

    /**
     * Returns true if the underlying source is ready for playing.
     *
     * @private
     * @return {boolean} True if ready.
     */
    _isSourceReady()
    {
        return this.source.readyState === 3 || this.source.readyState === 4;
    }

    /**
     * Runs the update loop when the video is ready to play
     *
     * @private
     */
    _onPlayStart()
    {
        // Just in case the video has not received its can play even yet..
        if (!this.hasLoaded)
        {
            this._onCanPlay();
        }

        if (!this._isAutoUpdating && this.autoUpdate)
        {
            shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
            this._isAutoUpdating = true;
        }
    }

    /**
     * Fired when a pause event is triggered, stops the update loop
     *
     * @private
     */
    _onPlayStop()
    {
        if (this._isAutoUpdating)
        {
            shared.remove(this.update, this);
            this._isAutoUpdating = false;
        }
    }

    /**
     * Fired when the video is loaded and ready to play
     *
     * @private
     */
    _onCanPlay()
    {
        this.hasLoaded = true;

        if (this.source)
        {
            this.source.removeEventListener('canplay', this._onCanPlay);
            this.source.removeEventListener('canplaythrough', this._onCanPlay);

            this.width = this.source.videoWidth;
            this.height = this.source.videoHeight;

            // prevent multiple loaded dispatches..
            if (!this.__loaded)
            {
                this.__loaded = true;
                this.emit('loaded', this);
            }

            if (this._isSourcePlaying())
            {
                this._onPlayStart();
            }
            else if (this.autoPlay)
            {
                this.source.play();
            }
        }
    }

    /**
     * Destroys this texture
     *
     */
    destroy()
    {
        if (this._isAutoUpdating)
        {
            shared.remove(this.update, this);
        }

        if (this.source && this.source._pixiId)
        {
            BaseTexture.removeFromCache(this.source._pixiId);
            delete this.source._pixiId;
        }

        super.destroy();
    }

    /**
     * Mimic Pixi BaseTexture.from.... method.
     *
     * @static
     * @param {HTMLVideoElement} video - Video to create texture from
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.VideoBaseTexture} Newly created VideoBaseTexture
     */
    static fromVideo(video, scaleMode)
    {
        if (!video._pixiId)
        {
            video._pixiId = `video_${uid()}`;
        }

        let baseTexture = BaseTextureCache[video._pixiId];

        if (!baseTexture)
        {
            baseTexture = new VideoBaseTexture(video, scaleMode);
            BaseTexture.addToCache(baseTexture, video._pixiId);
        }

        return baseTexture;
    }

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
    static fromUrl(videoSrc, scaleMode)
    {
        const video = document.createElement('video');

        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('playsinline', '');

        // array of objects or strings
        if (Array.isArray(videoSrc))
        {
            for (let i = 0; i < videoSrc.length; ++i)
            {
                video.appendChild(createSource(videoSrc[i].src || videoSrc[i], videoSrc[i].mime));
            }
        }
        // single object or string
        else
        {
            video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
        }

        video.load();

        return VideoBaseTexture.fromVideo(video, scaleMode);
    }

    /**
     * Should the base texture automatically update itself, set to true by default
     *
     * @member {boolean}
     */
    get autoUpdate()
    {
        return this._autoUpdate;
    }

    set autoUpdate(value) // eslint-disable-line require-jsdoc
    {
        if (value !== this._autoUpdate)
        {
            this._autoUpdate = value;

            if (!this._autoUpdate && this._isAutoUpdating)
            {
                shared.remove(this.update, this);
                this._isAutoUpdating = false;
            }
            else if (this._autoUpdate && !this._isAutoUpdating)
            {
                shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
                this._isAutoUpdating = true;
            }
        }
    }
}

VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;

function createSource(path, type)
{
    if (!type)
    {
        type = `video/${path.substr(path.lastIndexOf('.') + 1)}`;
    }

    const source = document.createElement('source');

    source.src = path;
    source.type = type;

    return source;
}

import { BaseImageResource } from './BaseImageResource';
import { Ticker } from '@pixi/ticker';

/**
 * Resource type for HTMLVideoElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
 * @param {object} [options] - Options to use
 * @param {boolean} [options.autoLoad=true] - Start loading the video immediately
 * @param {boolean} [options.autoPlay=true] - Start playing video immediately
 * @param {number} [options.updateFPS=0] - How many times a second to update the texture from the video.
 * Leave at 0 to update at every render.
 * @param {boolean} [options.crossorigin=true] - Load image using cross origin
 */
export class VideoResource extends BaseImageResource
{
    constructor(source, options)
    {
        options = options || {};

        if (!(source instanceof HTMLVideoElement))
        {
            const videoElement = document.createElement('video');

            // workaround for https://github.com/pixijs/pixi.js/issues/5996
            videoElement.setAttribute('preload', 'auto');
            videoElement.setAttribute('webkit-playsinline', '');
            videoElement.setAttribute('playsinline', '');

            if (typeof source === 'string')
            {
                source = [source];
            }

            BaseImageResource.crossOrigin(videoElement, (source[0].src || source[0]), options.crossorigin);

            // array of objects or strings
            for (let i = 0; i < source.length; ++i)
            {
                const sourceElement = document.createElement('source');

                let { src, mime } = source[i];

                src = src || source[i];

                const baseSrc = src.split('?').shift().toLowerCase();
                const ext = baseSrc.substr(baseSrc.lastIndexOf('.') + 1);

                mime = mime || `video/${ext}`;

                sourceElement.src = src;
                sourceElement.type = mime;

                videoElement.appendChild(sourceElement);
            }

            // Override the source
            source = videoElement;
        }

        super(source);

        this.noSubImage = true;
        this._autoUpdate = true;
        this._isAutoUpdating = false;
        this._updateFPS = options.updateFPS || 0;
        this._msToNextUpdate = 0;

        /**
         * When set to true will automatically play videos used by this texture once
         * they are loaded. If false, it will not modify the playing state.
         *
         * @member {boolean}
         * @default true
         */
        this.autoPlay = options.autoPlay !== false;

        /**
         * Promise when loading
         * @member {Promise<void>}
         * @private
         * @default null
         */
        this._load = null;

        /**
         * Callback when completed with load.
         * @member {function}
         * @private
         */
        this._resolve = null;

        // Bind for listeners
        this._onCanPlay = this._onCanPlay.bind(this);
        this._onError = this._onError.bind(this);

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    /**
     * Trigger updating of the texture
     *
     * @param {number} [deltaTime=0] - time delta since last tick
     */
    update(deltaTime = 0)
    {
        if (!this.destroyed)
        {
            // account for if video has had its playbackRate changed
            const elapsedMS = Ticker.shared.elapsedMS * this.source.playbackRate;

            this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
            if (!this._updateFPS || this._msToNextUpdate <= 0)
            {
                super.update(deltaTime);
                this._msToNextUpdate = this._updateFPS ? Math.floor(1000 / this._updateFPS) : 0;
            }
        }
    }

    /**
     * Start preloading the video resource.
     *
     * @protected
     * @return {Promise<void>} Handle the validate event
     */
    load()
    {
        if (this._load)
        {
            return this._load;
        }

        const source = this.source;

        if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA)
            && source.width && source.height)
        {
            source.complete = true;
        }

        source.addEventListener('play', this._onPlayStart.bind(this));
        source.addEventListener('pause', this._onPlayStop.bind(this));

        if (!this._isSourceReady())
        {
            source.addEventListener('canplay', this._onCanPlay);
            source.addEventListener('canplaythrough', this._onCanPlay);
            source.addEventListener('error', this._onError, true);
        }
        else
        {
            this._onCanPlay();
        }

        this._load = new Promise((resolve) =>
        {
            if (this.valid)
            {
                resolve(this);
            }
            else
            {
                this._resolve = resolve;

                source.load();
            }
        });

        return this._load;
    }

    /**
     * Handle video error events.
     *
     * @private
     */
    _onError()
    {
        this.source.removeEventListener('error', this._onError, true);
        this.onError.run(event);
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
        if (!this.valid)
        {
            this._onCanPlay();
        }

        if (!this._isAutoUpdating && this.autoUpdate)
        {
            Ticker.shared.add(this.update, this);
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
            Ticker.shared.remove(this.update, this);
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
        const { source } = this;

        source.removeEventListener('canplay', this._onCanPlay);
        source.removeEventListener('canplaythrough', this._onCanPlay);

        const valid = this.valid;

        this.resize(source.videoWidth, source.videoHeight);

        // prevent multiple loaded dispatches..
        if (!valid && this._resolve)
        {
            this._resolve(this);
            this._resolve = null;
        }

        if (this._isSourcePlaying())
        {
            this._onPlayStart();
        }
        else if (this.autoPlay)
        {
            source.play();
        }
    }

    /**
     * Destroys this texture
     * @override
     */
    dispose()
    {
        if (this._isAutoUpdating)
        {
            Ticker.shared.remove(this.update, this);
        }

        if (this.source)
        {
            this.source.removeEventListener('error', this._onError, true);
            this.source.pause();
            this.source.src = '';
            this.source.load();
        }
        super.dispose();
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
                Ticker.shared.remove(this.update, this);
                this._isAutoUpdating = false;
            }
            else if (this._autoUpdate && !this._isAutoUpdating)
            {
                Ticker.shared.add(this.update, this);
                this._isAutoUpdating = true;
            }
        }
    }

    /**
     * How many times a second to update the texture from the video. Leave at 0 to update at every render.
     * A lower fps can help performance, as updating the texture at 60fps on a 30ps video may not be efficient.
     *
     * @member {number}
     */
    get updateFPS()
    {
        return this._updateFPS;
    }

    set updateFPS(value) // eslint-disable-line require-jsdoc
    {
        if (value !== this._updateFPS)
        {
            this._updateFPS = value;
        }
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     * @return {boolean} `true` if video source
     */
    static test(source, extension)
    {
        return (source instanceof HTMLVideoElement)
            || VideoResource.TYPES.indexOf(extension) > -1;
    }
}

/**
 * List of common video file extensions supported by VideoResource.
 * @constant
 * @member {Array<string>}
 * @static
 * @readonly
 */
VideoResource.TYPES = ['mp4', 'm4v', 'webm', 'ogg', 'ogv', 'h264', 'avi', 'mov'];

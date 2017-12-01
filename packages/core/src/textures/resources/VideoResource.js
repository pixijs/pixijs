import BaseImageResource from './BaseImageResource';
import { Ticker } from '@pixi/ticker';

/**
 * Resource type for HTMLVideoElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
 * @param {boolean} [autoLoad=true] - Start loading the video immediately
 */
export default class VideoResource extends BaseImageResource
{
    constructor(source, autoLoad = true)
    {
        if (!(source instanceof HTMLVideoElement))
        {
            const videoElement = document.createElement('video');

            videoElement.setAttribute('webkit-playsinline', '');
            videoElement.setAttribute('playsinline', '');

            if (typeof source === 'string')
            {
                source = [source];
            }

            // array of objects or strings
            for (let i = 0; i < source.length; ++i)
            {
                const sourceElement = document.createElement('source');

                const { src, mime } = source[i];

                sourceElement.src = src || source[i];
                sourceElement.type = mime || `video/${src.substr(src.lastIndexOf('.') + 1)}`;

                videoElement.appendChild(sourceElement);
            }

            // Override the source
            source = videoElement;
        }

        super(source);

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

        // Bind for listeners
        this._onCanPlay = this._onCanPlay.bind(this);

        if (autoLoad)
        {
            this.load();
        }
    }

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
        }
        else
        {
            this._onCanPlay();
        }

        this._load = new Promise((resolve) =>
        {
            this.resolve = resolve;

            if (this.loaded)
            {
                this.resolve(this);
            }
        });

        return this._load;
    }

    /**
     * Override the width getter
     * @member {number}
     * @override
     * @readonly
     */
    get width()
    {
        return this.source.videoWidth || 0;
    }

    /**
     * Override the height getter
     * @member {number}
     * @override
     * @readonly
     */
    get height()
    {
        return this.source.videoHeight || 0;
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
        if (!this.loaded)
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

        this.resize(source.videoWidth, source.videoHeight);

        // prevent multiple loaded dispatches..
        if (!this.loaded)
        {
            this.loaded = true;
            if (this.resolve)
            {
                this.resolve(this);
            }
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
}

/**
 * List of common video file extensions supported by VideoResource.
 * @constant
 * @member {Array<string>}
 * @static
 * @readonly
 */
VideoResource.TYPES = ['mp4', 'm4v', 'webm', 'ogg', 'ogv', 'h264', 'avi', 'mov'];

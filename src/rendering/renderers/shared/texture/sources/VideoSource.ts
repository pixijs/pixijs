// VideoSource.ts

import { Ticker } from '../../../../../ticker/Ticker';
import { crossOrigin } from '../utils/crossOrigin';
import { TextureSource } from './TextureSource';

import type { Dict } from '../../../../../utils/types';
import type { TextureSourceOptions } from './TextureSource';

type VideoResource = HTMLVideoElement;

export interface VideoSourceOptions extends TextureSourceOptions<VideoResource>
{
    autoLoad?: boolean;
    autoPlay?: boolean;
    updateFPS?: number;
    crossorigin?: boolean | string;
    loop?: boolean;
    muted?: boolean;
    playsinline?: boolean;
}

export interface VideoResourceOptionsElement
{
    src: string;
    mime: string;
}

export class VideoSource extends TextureSource<VideoResource>
{
    public alphaMode = 0;
    public uploadMethodId = 'video';
    public isReady = false;

    public static defaultOptions: VideoSourceOptions = {
        ...TextureSource.defaultOptions,
        autoLoad: true,
        autoPlay: true,
        updateFPS: 0,
        crossorigin: true,
        loop: false,
        muted: true,
        playsinline: true,
    };

    /**
     * `true` to use Ticker.shared to auto update the base texture.
     * @default true
     */
    private _autoUpdate: boolean;

    /**
     * `true` if the instance is currently connected to PIXI.Ticker.shared to auto update the base texture.
     * @default false
     */
    private _isConnectedToTicker: boolean;
    private _updateFPS: number;
    private _msToNextUpdate: number;

    private _videoFrameRequestCallbackHandle: number | null;

    /**
     * When set to true will automatically play videos used by this texture once
     * they are loaded. If false, it will not modify the playing state.
     * @default true
     */
    protected autoPlay: boolean;

    /**
     * Promise when loading.
     * @default null
     */
    private _load: Promise<this>;

    /** Callback when completed with load. */
    private _resolve: (value?: this | PromiseLike<this>) => void;
    private _reject: (error: ErrorEvent) => void;

    /**
     * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
     * @param {object} [options] - Options to use
     * @param {boolean} [options.autoLoad=true] - Start loading the video immediately
     * @param {boolean} [options.autoPlay=true] - Start playing video immediately
     * @param {number} [options.updateFPS=0] - How many times a second to update the texture from the video.
     * Leave at 0 to update at every render.
     * @param {boolean} [options.crossorigin=true] - Load image using cross origin
     * @param {boolean} [options.loop=false] - Loops the video
     * @param {boolean} [options.muted=false] - Mutes the video audio, useful for autoplay
     * @param {boolean} [options.playsinline=true] - Prevents opening the video on mobile devices
     */
    public static from(
        source?: HTMLVideoElement | Array<string | VideoResourceOptionsElement> | string,
        options?: VideoSourceOptions
    )
    {
        options = {
            ...VideoSource.defaultOptions,
            ...(options || {}),
        };

        if (!(source instanceof HTMLVideoElement))
        {
            const videoElement = document.createElement('video');

            // workaround for https://github.com/pixijs/pixijs/issues/5996
            if (options.autoLoad !== false)
            {
                videoElement.setAttribute('preload', 'auto');
            }

            if (options.playsinline !== false)
            {
                videoElement.setAttribute('webkit-playsinline', '');
                videoElement.setAttribute('playsinline', '');
            }

            if (options.muted === true)
            {
                // For some reason we need to set both muted flags for chrome to autoplay
                // https://stackoverflow.com/a/51189390

                videoElement.setAttribute('muted', '');
                videoElement.muted = true;
            }

            if (options.loop === true)
            {
                videoElement.setAttribute('loop', '');
            }

            if (options.autoPlay !== false)
            {
                videoElement.setAttribute('autoplay', '');
            }

            if (typeof source === 'string')
            {
                source = [source];
            }

            const firstSrc = (source[0] as VideoResourceOptionsElement).src || source[0] as string;

            crossOrigin(videoElement, firstSrc, options.crossorigin);

            // array of objects or strings
            for (let i = 0; i < source.length; ++i)
            {
                const sourceElement = document.createElement('source');

                let { src, mime } = source[i] as VideoResourceOptionsElement;

                src = src || source[i] as string;

                if (src.startsWith('data:'))
                {
                    mime = src.slice(5, src.indexOf(';'));
                }
                else if (!src.startsWith('blob:'))
                {
                    const baseSrc = src.split('?').shift().toLowerCase();
                    const ext = baseSrc.slice(baseSrc.lastIndexOf('.') + 1);

                    mime = mime || VideoSource.MIME_TYPES[ext] || `video/${ext}`;
                }

                sourceElement.src = src;

                if (mime)
                {
                    sourceElement.type = mime;
                }

                videoElement.appendChild(sourceElement);
            }

            // Override the source
            source = videoElement;
        }

        return new VideoSource({
            ...options,
            resource: source,
        });
    }

    constructor(
        options: VideoSourceOptions
    )
    {
        super({
            ...VideoSource.defaultOptions,
            ...options,
        });

        this._autoUpdate = true;
        this._isConnectedToTicker = false;

        this._updateFPS = options.updateFPS || 0;
        this._msToNextUpdate = 0;
        this.autoPlay = options.autoPlay !== false;

        this._videoFrameRequestCallback = this._videoFrameRequestCallback.bind(this);
        this._videoFrameRequestCallbackHandle = null;

        this._load = null;
        this._resolve = null;
        this._reject = null;

        // Bind for listeners
        this._onCanPlay = this._onCanPlay.bind(this);
        this._onError = this._onError.bind(this);
        this._onPlayStart = this._onPlayStart.bind(this);
        this._onPlayStop = this._onPlayStop.bind(this);
        this._onSeeked = this._onSeeked.bind(this);

        if (options.autoLoad !== false)
        {
            void this.load();
        }
    }

    protected updateFrame(): void
    {
        if (!this.destroyed)
        {
            if (this._updateFPS)
            {
                // account for if video has had its playbackRate changed
                const elapsedMS = Ticker.shared.elapsedMS * this.resource.playbackRate;

                this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
            }

            if (!this._updateFPS || this._msToNextUpdate <= 0)
            {
                // super.update();
                this._msToNextUpdate = this._updateFPS ? Math.floor(1000 / this._updateFPS) : 0;
            }

            if (this.isValid)
            {
                this.update();
            }
        }
    }

    private _videoFrameRequestCallback(): void
    {
        this.updateFrame();

        if (!this.destroyed)
        {
            this._videoFrameRequestCallbackHandle = (this.source as any).requestVideoFrameCallback(
                this._videoFrameRequestCallback);
        }
        else
        {
            this._videoFrameRequestCallbackHandle = null;
        }
    }

    public get isValid()
    {
        return !!this.resource.videoWidth && !!this.resource.videoHeight;
    }

    /**
     * Start preloading the video resource.
     * @returns {Promise<void>} Handle the validate event
     */
    public load(): Promise<this>
    {
        if (this._load)
        {
            return this._load;
        }

        const source = this.resource;

        if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA)
            && source.width && source.height)
        {
            (source as any).complete = true;
        }

        source.addEventListener('play', this._onPlayStart);
        source.addEventListener('pause', this._onPlayStop);
        source.addEventListener('seeked', this._onSeeked);

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

        this._load = new Promise((resolve, reject): void =>
        {
            if (this.isValid)
            {
                resolve(this);
            }
            else
            {
                this._resolve = resolve;
                this._reject = reject;

                source.load();
            }
        });

        return this._load;
    }

    /**
     * Handle video error events.
     * @param event
     */
    private _onError(event: ErrorEvent): void
    {
        this.resource.removeEventListener('error', this._onError, true);
        this.emit('error', event);

        if (this._reject)
        {
            this._reject(event);
            this._reject = null;
            this._resolve = null;
        }
    }

    /**
     * Returns true if the underlying source is playing.
     * @returns - True if playing.
     */
    private _isSourcePlaying(): boolean
    {
        const source = this.resource;

        return (!source.paused && !source.ended && this._isSourceReady());
    }

    /**
     * Returns true if the underlying source is ready for playing.
     * @returns - True if ready.
     */
    private _isSourceReady(): boolean
    {
        const source = this.resource;

        return source.readyState > 2;
    }

    /** Runs the update loop when the video is ready to play. */
    private _onPlayStart(): void
    {
        // Just in case the video has not received its can play even yet..
        if (!this.isValid)
        {
            this._onCanPlay();
        }

        this._configureAutoUpdate();
    }

    /** Fired when a pause event is triggered, stops the update loop. */
    private _onPlayStop(): void
    {
        this._configureAutoUpdate();
    }

    /** Fired when the video is completed seeking to the current playback position. */
    private _onSeeked(): void
    {
        if (this._autoUpdate && !this._isSourcePlaying())
        {
            this._msToNextUpdate = 0;
            this.updateFrame();
            this._msToNextUpdate = 0;
        }
    }

    /** Fired when the video is loaded and ready to play. */
    private _onCanPlay(): void
    {
        const source = this.resource;

        source.removeEventListener('canplay', this._onCanPlay);
        source.removeEventListener('canplaythrough', this._onCanPlay);

        if (this.isValid)
        {
            this.isReady = true;

            this.resize(source.videoWidth, source.videoHeight);
            // this.width = source.videoWidth;
            // this.height = source.videoHeight;

            // document.body.appendChild(source);
            // source.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 1000;';
        }

        this._msToNextUpdate = 0;
        this.updateFrame();
        this._msToNextUpdate = 0;

        // prevent multiple loaded dispatches..
        if (!this.isValid && this._resolve)
        {
            this._resolve(this);
            this._resolve = null;
            this._reject = null;
        }

        if (this._isSourcePlaying())
        {
            this._onPlayStart();
        }
        else if (this.autoPlay)
        {
            void this.resource.play();
        }
    }

    /** Destroys this texture. */
    public destroy()
    {
        this._configureAutoUpdate();

        const source = this.resource;

        if (source)
        {
            source.removeEventListener('play', this._onPlayStart);
            source.removeEventListener('pause', this._onPlayStop);
            source.removeEventListener('seeked', this._onSeeked);
            source.removeEventListener('canplay', this._onCanPlay);
            source.removeEventListener('canplaythrough', this._onCanPlay);
            source.removeEventListener('error', this._onError, true);
            source.pause();
            source.src = '';
            source.load();
        }

        super.destroy();
    }

    /** Should the base texture automatically update itself, set to true by default. */
    get autoUpdate(): boolean
    {
        return this._autoUpdate;
    }

    set autoUpdate(value: boolean)
    {
        if (value !== this._autoUpdate)
        {
            this._autoUpdate = value;
            this._configureAutoUpdate();
        }
    }

    /**
     * How many times a second to update the texture from the video. Leave at 0 to update at every render.
     * A lower fps can help performance, as updating the texture at 60fps on a 30ps video may not be efficient.
     */
    get updateFPS(): number
    {
        return this._updateFPS;
    }

    set updateFPS(value: number)
    {
        if (value !== this._updateFPS)
        {
            this._updateFPS = value;
            this._configureAutoUpdate();
        }
    }

    private _configureAutoUpdate(): void
    {
        if (this._autoUpdate && this._isSourcePlaying())
        {
            if (!this._updateFPS && (this.source as any).requestVideoFrameCallback)
            {
                if (this._isConnectedToTicker)
                {
                    Ticker.shared.remove(this.updateFrame, this);
                    this._isConnectedToTicker = false;
                    this._msToNextUpdate = 0;
                }

                if (this._videoFrameRequestCallbackHandle === null)
                {
                    this._videoFrameRequestCallbackHandle = (this.source as any).requestVideoFrameCallback(
                        this._videoFrameRequestCallback);
                }
            }
            else
            {
                if (this._videoFrameRequestCallbackHandle !== null)
                {
                    (this.source as any).cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle);
                    this._videoFrameRequestCallbackHandle = null;
                }

                if (!this._isConnectedToTicker)
                {
                    Ticker.shared.add(this.updateFrame, this);
                    this._isConnectedToTicker = true;
                    this._msToNextUpdate = 0;
                }
            }
        }
        else
        {
            if (this._videoFrameRequestCallbackHandle !== null)
            {
                (this.source as any).cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle);
                this._videoFrameRequestCallbackHandle = null;
            }

            if (this._isConnectedToTicker)
            {
                Ticker.shared.remove(this.updateFrame, this);
                this._isConnectedToTicker = false;
                this._msToNextUpdate = 0;
            }
        }
    }

    /**
     * Used to auto-detect the type of resource.
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     * @returns {boolean} `true` if video source
     */
    public static test(source: unknown, extension?: string): source is HTMLVideoElement
    {
        return (globalThis.HTMLVideoElement && source instanceof HTMLVideoElement)
            || VideoSource.TYPES.includes(extension);
    }

    /**
     * List of common video file extensions supported by VideoResource.
     * @readonly
     */
    public static TYPES: Array<string> = ['mp4', 'm4v', 'webm', 'ogg', 'ogv', 'h264', 'avi', 'mov'];

    /**
     * Map of video MIME types that can't be directly derived from file extensions.
     * @readonly
     */
    public static MIME_TYPES: Dict<string> = {
        ogv: 'video/ogg',
        mov: 'video/quicktime',
        m4v: 'video/mp4',
    };
}

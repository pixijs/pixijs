// VideoSource.ts

import { TextureSource } from './TextureSource';

import type { TextureSourceOptions } from './TextureSource';

type VideoResource = HTMLVideoElement;

export interface VideoSourceOptions extends TextureSourceOptions<VideoResource>
{
    autoPlay?: boolean;
    autoLoad?: boolean;
    loop?: boolean;
    muted?: boolean;
    updateFPS?: number;
}

export class VideoSource extends TextureSource<VideoResource>
{
    public uploadMethodId = 'image';
    public alphaMode = 0;

    public autoPlay: boolean;
    public autoLoad: boolean;
    public loop: boolean;
    public muted: boolean;
    public updateFPS: number;
    private readonly _updateFPS: number;
    private _elapsedMS = 0;
    private _isAutoUpdating = false;
    private _requestFrameId = 0;

    constructor(options: VideoSourceOptions)
    {
        super(options);

        this.autoPlay = options.autoPlay ?? false;
        this.autoLoad = options.autoLoad ?? false;
        this.loop = options.loop ?? false;
        this.muted = options.muted ?? false;
        this.updateFPS = options.updateFPS ?? 0;
        this._updateFPS = 1000 / this.updateFPS;

        if (options.resource)
        {
            this.resource = options.resource;
        }

        if (this.autoLoad)
        {
            void this.load();
        }

        this._setupVideoListeners();
    }

    public load(): Promise<void>
    {
        if (this.resource)
        {
            return new Promise((resolve) =>
            {
                const canPlay = (): void =>
                {
                    this.resource.removeEventListener('canplay', canPlay);
                    resolve();
                };

                if (this.resource.readyState >= 2)
                {
                    resolve();
                }
                else
                {
                    this.resource.addEventListener('canplay', canPlay);
                }

                if (this.resource.readyState === 0)
                {
                    this.resource.load();
                }
            });
        }

        return Promise.reject();
    }

    private _setupVideoListeners(): void
    {
        this.resource.addEventListener('play', this._onPlay);
        this.resource.addEventListener('pause', this._onPause);
        this.resource.addEventListener('end', this._onEnd);
    }

    private readonly _onPlay = (): void =>
    {
        this._autoUpdate();
    };

    private readonly _onPause = (): void =>
    {
        this._autoUpdate();
    };

    private readonly _onEnd = (): void =>
    {
        if (this.loop)
        {
            void this.resource.play();
        }
    };

    private _autoUpdate(): void
    {
        if (this.autoPlay && !this._isAutoUpdating)
        {
            this._isAutoUpdating = true;
            this._updateBound = this._update.bind(this);
            this._requestFrameId = requestAnimationFrame(this._updateBound);
        }
        else if (!this.autoPlay && this._isAutoUpdating)
        {
            this._isAutoUpdating = false;
            cancelAnimationFrame(this._requestFrameId);
        }
    }

    private _updateBound: FrameRequestCallback;

    private _update(deltaTime: number): void
    {
        this._elapsedMS += deltaTime;

        if (!this.autoPlay)
        {
            this._isAutoUpdating = false;

            return;
        }

        if (this._updateFPS <= 0 || this._elapsedMS > this._updateFPS)
        {
            this._elapsedMS = 0;
            // Here, v7 logic of texture updates would occur.
            // It might require you to dispatch some events or directly update the texture.
        }

        if (this._isAutoUpdating)
        {
            this._requestFrameId = requestAnimationFrame(this._updateBound);
        }
    }
}

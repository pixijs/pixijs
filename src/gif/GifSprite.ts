import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { Sprite, type SpriteOptions } from '../scene/sprite/Sprite';
import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';
import { GifSource } from './GifSource';

import type { SCALE_MODE } from '../rendering/renderers/shared/texture/const';

/**
 * Optional module to import to decode and play animated GIFs.
 * @example
 * import { Assets } from 'pixi.js';
 * import { GifSprite } from 'pixi.js/gif';
 *
 * const source = await Assets.load('example.gif');
 * const gif = new GifSprite({ source });
 * @namespace gif
 */

/**
 * Default options for all GifSprite objects.
 * @memberof gif
 */
interface GifSpriteOptions extends Omit<SpriteOptions, 'texture'>
{
    /** Source to the GIF frame and animation data */
    source: GifSource;
    /** Whether to start playing right away */
    autoPlay?: boolean;
    /**
     * Scale Mode to use for the texture
     * @type {PIXI.SCALE_MODE}
     */
    scaleMode?: SCALE_MODE;
    /** To enable looping */
    loop?: boolean;
    /** Speed of the animation */
    animationSpeed?: number;
    /** Set to `false` to manage updates yourself */
    autoUpdate?: boolean;
    /** The completed callback, optional */
    onComplete?: null | (() => void);
    /** The loop callback, optional */
    onLoop?: null | (() => void);
    /** The frame callback, optional */
    onFrameChange?: null | ((currentFrame: number) => void);
    /** Fallback FPS if GIF contains no time information */
    fps?: number;
}

/**
 * Runtime object to play animated GIFs. This object is similar to an AnimatedSprite.
 * It support playback (seek, play, stop) as well as animation speed and looping.
 * @memberof gif
 * @see Thanks to {@link https://github.com/matt-way/gifuct-js/ gifuct-js}
 */
class GifSprite extends Sprite
{
    /**
     * Default options for all GifSprite objects.
     * @property {PIXI.SCALE_MODE} [scaleMode='linear'] - Scale mode to use for the texture.
     * @property {boolean} [loop=true] - To enable looping.
     * @property {number} [animationSpeed=1] - Speed of the animation.
     * @property {boolean} [autoUpdate=true] - Set to `false` to manage updates yourself.
     * @property {boolean} [autoPlay=true] - To start playing right away.
     * @property {Function} [onComplete=null] - The completed callback, optional.
     * @property {Function} [onLoop=null] - The loop callback, optional.
     * @property {Function} [onFrameChange=null] - The frame callback, optional.
     * @property {number} [fps=30] - Fallback FPS if GIF contains no time information.
     */
    public static defaultOptions: Omit<GifSpriteOptions, 'source'> = {
        scaleMode: 'linear',
        fps: 30,
        loop: true,
        animationSpeed: 1,
        autoPlay: true,
        autoUpdate: true,
        onComplete: null,
        onFrameChange: null,
        onLoop: null,
    };

    /**
     * The speed that the animation will play at. Higher is faster, lower is slower.
     * @default 1
     */
    public animationSpeed = 1;

    /**
     * Whether or not the animate sprite repeats after playing.
     * @default true
     */
    public loop = true;

    /**
     * User-assigned function to call when animation finishes playing. This only happens
     * if loop is set to `false`.
     * @example
     * animation.onComplete = () => {
     *   // finished!
     * };
     */
    public onComplete?: () => void;

    /**
     * User-assigned function to call when animation changes which texture is being rendered.
     * @example
     * animation.onFrameChange = () => {
     *   // updated!
     * };
     */
    public onFrameChange?: (currentFrame: number) => void;

    /**
     * User-assigned function to call when `loop` is true, and animation is played and
     * loops around to start again. This only happens if loop is set to `true`.
     * @example
     * animation.onLoop = () => {
     *   // looped!
     * };
     */
    public onLoop?: () => void;

    /** The total duration of animation in milliseconds. */
    public readonly duration: number = 0;

    /** Whether to play the animation after constructing. */
    public readonly autoPlay: boolean = true;

    /** Collection of frame to render. */
    private _source: GifSource;

    /** Dirty means the image needs to be redrawn. Set to `true` to force redraw. */
    public dirty = false;

    /** The current frame number (zero-based index). */
    private _currentFrame = 0;

    /** `true` uses PIXI.Ticker.shared to auto update animation time.*/
    private _autoUpdate = false;

    /** `true` if the instance is currently connected to PIXI.Ticker.shared to auto update animation time. */
    private _isConnectedToTicker = false;

    /** If animation is currently playing. */
    private _playing = false;

    /** Current playback position in milliseconds. */
    private _currentTime = 0;

    /**
     * @param source - Source, default options will be used.
     */
    constructor(source: GifSource);

    /**
     * @param options - Options for the GifSprite
     */
    constructor(options: GifSpriteOptions);

    /** @ignore */
    constructor(...args: [GifSource] | [GifSpriteOptions])
    {
        const options = args[0] instanceof GifSource ? { source: args[0] } : args[0];

        // Get the options, apply defaults
        const {
            scaleMode,
            source,
            fps,
            loop,
            animationSpeed,
            autoPlay,
            autoUpdate,
            onComplete,
            onFrameChange,
            onLoop,
            ...rest
        } = Object.assign({},
            GifSprite.defaultOptions,
            options
        );

        super({ texture: Texture.EMPTY, ...rest });

        // Handle rerenders
        this.onRender = () => this._updateFrame();

        this.texture = source.textures[0];

        this.duration = source.frames[source.frames.length - 1].end;
        this._source = source;
        this._playing = false;
        this._currentTime = 0;
        this._isConnectedToTicker = false;
        Object.assign(this, {
            fps,
            loop,
            animationSpeed,
            autoPlay,
            autoUpdate,
            onComplete,
            onFrameChange,
            onLoop,
        });

        // Draw the first frame
        this.currentFrame = 0;
        if (autoPlay)
        {
            this.play();
        }
    }

    /** Stops the animation. */
    public stop(): void
    {
        if (!this._playing)
        {
            return;
        }

        this._playing = false;
        if (this._autoUpdate && this._isConnectedToTicker)
        {
            Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
        }
    }

    /** Plays the animation. */
    public play(): void
    {
        if (this._playing)
        {
            return;
        }

        this._playing = true;
        if (this._autoUpdate && !this._isConnectedToTicker)
        {
            Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
            this._isConnectedToTicker = true;
        }

        // If were on the last frame and stopped, play should resume from beginning
        if (!this.loop && this.currentFrame === this._source.frames.length - 1)
        {
            this._currentTime = 0;
        }
    }

    /**
     * Get the current progress of the animation from 0 to 1.
     * @readonly
     */
    public get progress(): number
    {
        return this._currentTime / this.duration;
    }

    /** `true` if the current animation is playing */
    public get playing(): boolean
    {
        return this._playing;
    }

    /**
     * Updates the object transform for rendering. You only need to call this
     * if the `autoUpdate` property is set to `false`.
     * @param ticker - Ticker instance
     */
    public update(ticker: Ticker): void
    {
        if (!this._playing)
        {
            return;
        }

        const elapsed = this.animationSpeed * ticker.deltaTime / Ticker.targetFPMS;
        const currentTime = this._currentTime + elapsed;
        const localTime = currentTime % this.duration;

        const localFrame = this._source.frames.findIndex((frame) =>
            frame.start <= localTime && frame.end > localTime);

        if (currentTime >= this.duration)
        {
            if (this.loop)
            {
                this._currentTime = localTime;
                this._updateFrameIndex(localFrame);
                this.onLoop?.();
            }
            else
            {
                this._currentTime = this.duration;
                this._updateFrameIndex(this.totalFrames - 1);
                this.onComplete?.();
                this.stop();
            }
        }
        else
        {
            this._currentTime = localTime;
            this._updateFrameIndex(localFrame);
        }
    }

    /** Redraw the current frame, is necessary for the animation to work when */
    private _updateFrame(): void
    {
        if (!this.dirty)
        {
            return;
        }

        // Update the current frame
        this.texture = this._source.frames[this._currentFrame].texture;

        // Mark as clean
        this.dirty = false;
    }

    /**
     * Whether to use PIXI.Ticker.shared to auto update animation time.
     * @default true
     */
    get autoUpdate(): boolean
    {
        return this._autoUpdate;
    }

    set autoUpdate(value: boolean)
    {
        if (value !== this._autoUpdate)
        {
            this._autoUpdate = value;

            if (!this._autoUpdate && this._isConnectedToTicker)
            {
                Ticker.shared.remove(this.update, this);
                this._isConnectedToTicker = false;
            }
            else if (this._autoUpdate && !this._isConnectedToTicker && this._playing)
            {
                Ticker.shared.add(this.update, this);
                this._isConnectedToTicker = true;
            }
        }
    }

    /** Set the current frame number */
    get currentFrame(): number
    {
        return this._currentFrame;
    }
    set currentFrame(value: number)
    {
        this._updateFrameIndex(value);
        this._currentTime = this._source.frames[value].start;
    }

    /** Instance of the data, contains frame textures */
    get source(): GifSource
    {
        return this._source;
    }

    /**
     * Internally handle updating the frame index
     * @param value
     */
    private _updateFrameIndex(value: number): void
    {
        if (value < 0 || value >= this.totalFrames)
        {
            throw new Error(`Frame index out of range, expecting 0 to ${this.totalFrames}, got ${value}`);
        }
        if (this._currentFrame !== value)
        {
            this._currentFrame = value;
            this.dirty = true;
            this.onFrameChange?.(value);
        }
    }

    /** Get the total number of frame in the GIF. */
    get totalFrames(): number
    {
        return this._source.totalFrames;
    }

    /**
     * Destroy and don't use after this.
     * @param destroyData - Destroy the data, cannot be used again.
     */
    public destroy(destroyData: boolean = false): void
    {
        this.stop();
        super.destroy();

        if (destroyData)
        {
            this._source.destroy();
        }

        const forceClear = null as any;

        this._source = forceClear;
        this.onComplete = forceClear;
        this.onFrameChange = forceClear;
        this.onLoop = forceClear;
    }

    /**
     * Cloning the animation is a useful way to create a duplicate animation.
     * This maintains all the properties of the original animation but allows
     * you to control playback independent of the original animation.
     * If you want to create a simple copy, and not control independently,
     * then you can simply create a new Sprite, e.g. `const sprite = new Sprite(animation.texture)`.
     *
     * The clone will be flagged as `dirty` to immediatly trigger an update
     */
    public clone(): GifSprite
    {
        const clone = new GifSprite({
            source: this._source,
            autoUpdate: this._autoUpdate,
            loop: this.loop,
            autoPlay: this.autoPlay,
            scaleMode: this.texture.source.scaleMode,
            animationSpeed: this.animationSpeed,
            onComplete: this.onComplete,
            onFrameChange: this.onFrameChange,
            onLoop: this.onLoop,
        });

        clone.dirty = true;

        return clone;
    }
}

export { GifSprite };
export type { GifSpriteOptions };

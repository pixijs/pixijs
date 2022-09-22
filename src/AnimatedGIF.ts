import { Sprite } from '@pixi/sprite';
import { Texture, Renderer, settings, SCALE_MODES, Ticker, UPDATE_PRIORITY } from '@pixi/core';
import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js';

/** Represents a single frame of a GIF. Includes image and timing data. */
interface FrameObject {
    /** Image data for the current frame */
    imageData: ImageData;
    /** The start of the current frame, in milliseconds */
    start: number;
    /** The end of the current frame, in milliseconds */
    end: number;
}

/** Default options for all AnimatedGIF objects. */
interface AnimatedGIFOptions {
    /** Whether to start playing right away */
    autoPlay: boolean;
    /**
     * Scale Mode to use for the texture
     * @type {PIXI.SCALE_MODES}
     */
    scaleMode: SCALE_MODES;
    /** To enable looping */
    loop: boolean;
    /** Speed of the animation */
    animationSpeed: number;
    /** Set to `false` to manage updates yourself */
    autoUpdate: boolean;
    /** The completed callback, optional */
    onComplete: null | (() => void);
    /** The loop callback, optional */
    onLoop: null | (() => void);
    /** The frame callback, optional */
    onFrameChange: null | ((currentFrame: number) => void);
    /** Fallback FPS if GIF contains no time information */
    fps?: number;
}

/** Options for the AnimatedGIF constructor. */
interface AnimatedGIFSize {
    /** Width of the GIF image */
    width: number;
    /** Height of the GIF image */
    height: number;
}

/**
 * Runtime object to play animated GIFs. This object is similar to an AnimatedSprite.
 * It support playback (seek, play, stop) as well as animation speed and looping.
 * @see Thanks to {@link https://github.com/matt-way/gifuct-js/ gifuct-js}
 */
class AnimatedGIF extends Sprite
{
    /**
     * Default options for all AnimatedGIF objects.
     * @property {PIXI.SCALE_MODES} [scaleMode=PIXI.SCALE_MODES.LINEAR] - Scale mode to use for the texture.
     * @property {boolean} [loop=true] - To enable looping.
     * @property {number} [animationSpeed=1] - Speed of the animation.
     * @property {boolean} [autoUpdate=true] - Set to `false` to manage updates yourself.
     * @property {boolean} [autoPlay=true] - To start playing right away.
     * @property {Function} [onComplete=null] - The completed callback, optional.
     * @property {Function} [onLoop=null] - The loop callback, optional.
     * @property {Function} [onFrameChange=null] - The frame callback, optional.
     * @property {number} [fps=30] - Fallback FPS if GIF contains no time information.
     */
    public static defaultOptions: AnimatedGIFOptions = {
        scaleMode: SCALE_MODES.LINEAR,
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
     *
     * @example
     * animation.onComplete = () => {
     *   // finished!
     * };
     */
    public onComplete?: () => void;

    /**
     * User-assigned function to call when animation changes which texture is being rendered.
     *
     * @example
     * animation.onFrameChange = () => {
     *   // updated!
     * };
     */
    public onFrameChange?: (currentFrame: number) => void;

    /**
     * User-assigned function to call when `loop` is true, and animation is played and
     * loops around to start again. This only happens if loop is set to `true`.
     *
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
    private _frames: FrameObject[];

    /** Drawing context reference. */
    private _context: CanvasRenderingContext2D;

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
     * Create an animated GIF animation from a GIF image's ArrayBuffer. The easiest way to get
     * the buffer is to use Assets.
     * @example
     * import { Assets } from 'pixi.js';
     * import '@pixi/gif';
     *
     * const gif = await Assets.load('file.gif');
     * @param buffer - GIF image arraybuffer from Assets.
     * @param options - Options to use.
     * @returns
     */
    static fromBuffer(buffer: ArrayBuffer, options?: Partial<AnimatedGIFOptions>): AnimatedGIF
    {
        if (!buffer || buffer.byteLength === 0)
        {
            throw new Error('Invalid buffer');
        }

        // fix https://github.com/matt-way/gifuct-js/issues/30
        const validateAndFix = (gif: any): void =>
        {
            let currentGce = null;

            for (const frame of gif.frames)
            {
                currentGce = frame.gce ?? currentGce;

                // fix loosing graphic control extension for same frames
                if ('image' in frame && !('gce' in frame))
                {
                    frame.gce = currentGce;
                }
            }
        };

        const gif = parseGIF(buffer);

        validateAndFix(gif);
        const gifFrames = decompressFrames(gif, true);
        const frames: FrameObject[] = [];

        // Temporary canvases required for compositing frames
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const patchCanvas = document.createElement('canvas');
        const patchContext = patchCanvas.getContext('2d') as CanvasRenderingContext2D;

        canvas.width = gif.lsd.width;
        canvas.height = gif.lsd.height;

        let time = 0;

        // Some GIFs have a non-zero frame delay, so we need to calculate the fallback
        const { fps } = Object.assign({}, AnimatedGIF.defaultOptions, options);
        const defaultDelay = 1000 / (fps as number);

        // Precompute each frame and store as ImageData
        for (let i = 0; i < gifFrames.length; i++)
        {
            // Some GIF's omit the disposalType, so let's assume clear if missing
            const {
                disposalType = 2,
                delay = defaultDelay,
                patch,
                dims: { width, height, left, top },
            } = gifFrames[i] as ParsedFrame;

            patchCanvas.width = width;
            patchCanvas.height = height;
            patchContext.clearRect(0, 0, width, height);
            const patchData = patchContext.createImageData(width, height);

            patchData.data.set(patch);
            patchContext.putImageData(patchData, 0, 0);

            context.drawImage(patchCanvas, left, top);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            if (disposalType === 2 || disposalType === 3)
            {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            frames.push({
                start: time,
                end: time + delay,
                imageData,
            });
            time += delay;
        }

        // clear the canvases
        canvas.width = canvas.height = 0;
        patchCanvas.width = patchCanvas.height = 0;
        const { width, height } = gif.lsd;

        return new AnimatedGIF(frames, { width, height, ...options });
    }

    /**
     * @param frames - Data of the GIF image.
     * @param options - Options for the AnimatedGIF
     */
    constructor(frames: FrameObject[], options: Partial<AnimatedGIFOptions> & AnimatedGIFSize)
    {
        super(Texture.EMPTY);

        // Get the options, apply defaults
        const { scaleMode, width, height, ...rest } = Object.assign({},
            AnimatedGIF.defaultOptions,
            options
        );

        // Create the texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        canvas.width = width;
        canvas.height = height;

        this.texture = Texture.from(canvas, { scaleMode });

        this.duration = (frames[frames.length - 1] as FrameObject).end;
        this._frames = frames;
        this._context = context;
        this._playing = false;
        this._currentTime = 0;
        this._isConnectedToTicker = false;
        Object.assign(this, rest);

        // Draw the first frame
        this.currentFrame = 0;
        if (rest.autoPlay)
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
        if (!this.loop && this.currentFrame === this._frames.length - 1)
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
     *
     * @param deltaTime - Time since last tick.
     */
    update(deltaTime: number): void
    {
        if (!this._playing)
        {
            return;
        }

        const elapsed = this.animationSpeed * deltaTime / (settings.TARGET_FPMS as number);
        const currentTime = this._currentTime + elapsed;
        const localTime = currentTime % this.duration;

        const localFrame = this._frames.findIndex((frame) =>
            frame.start <= localTime && frame.end > localTime);

        if (currentTime >= this.duration)
        {
            if (this.loop)
            {
                this._currentTime = localTime;
                this.updateFrameIndex(localFrame);
                this.onLoop?.();
            }
            else
            {
                this._currentTime = this.duration;
                this.updateFrameIndex(this._frames.length - 1);
                this.onComplete?.();
                this.stop();
            }
        }
        else
        {
            this._currentTime = localTime;
            this.updateFrameIndex(localFrame);
        }
    }

    /**
     * Redraw the current frame, is necessary for the animation to work when
     */
    private updateFrame(): void
    {
        if (!this.dirty)
        {
            return;
        }

        // Update the current frame
        const { imageData } = this._frames[this._currentFrame] as FrameObject;

        this._context.putImageData(imageData, 0, 0);

        // Workaround hack for Safari & iOS
        // which fails to upload canvas after putImageData
        // See: https://bugs.webkit.org/show_bug.cgi?id=229986
        this._context.fillStyle = 'transparent';
        this._context.fillRect(0, 0, 0, 1);

        this.texture.update();

        // Mark as clean
        this.dirty = false;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.Renderer} renderer - The renderer
     * @private
     */
    _render(renderer: Renderer): void
    {
        this.updateFrame();

        super._render(renderer);
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.CanvasRenderer} renderer - The renderer
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    _renderCanvas(renderer: any): void
    {
        this.updateFrame();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super._renderCanvas(renderer);
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
        this.updateFrameIndex(value);
        this._currentTime = (this._frames[value] as FrameObject).start;
    }

    /** Internally handle updating the frame index */
    private updateFrameIndex(value: number): void
    {
        if (value < 0 || value >= this._frames.length)
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

    /**
     * Get the total number of frame in the GIF.
     */
    get totalFrames(): number
    {
        return this._frames.length;
    }

    /** Destroy and don't use after this. */
    destroy(): void
    {
        this.stop();
        super.destroy(true);

        const forceClear = null as any;

        this._context = forceClear;
        this._frames = forceClear;
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
     */
    clone(): AnimatedGIF
    {
        return new AnimatedGIF([...this._frames], {
            autoUpdate: this._autoUpdate,
            loop: this.loop,
            autoPlay: this.autoPlay,
            scaleMode: this.texture.baseTexture.scaleMode,
            animationSpeed: this.animationSpeed,
            width: this._context.canvas.width,
            height: this._context.canvas.height,
            onComplete: this.onComplete,
            onFrameChange: this.onFrameChange,
            onLoop: this.onLoop,
        });
    }
}

export { AnimatedGIF };
export type { AnimatedGIFOptions };

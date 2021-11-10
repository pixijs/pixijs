import { Sprite } from '@pixi/sprite';
import { Texture, Renderer } from '@pixi/core';
import { settings } from '@pixi/settings';
import { SCALE_MODES } from '@pixi/constants';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { parseGIF, decompressFrames } from 'gifuct-js';

/**
 * Frame object.
 */
interface FrameObject {
    /** Image data for the current frame */
    imageData: ImageData;
    /** The start of the current frame, in milliseconds */
    start: number;
    /** How long this frame lasts, in milliseconds */
    end: number;
}
/**
 * Options for the AnimatedGIF constructor.
 */
interface AnimatedGIFOptions {
    /** Whether to start playing right away */
    autoPlay: boolean;
    /** Scale Mode to use for the texture */
    scaleMode: SCALE_MODES;
    /** To enable looping */
    loop: boolean;
    /** Speed of the animation */
    animationSpeed: number;
    /** Set to `false` to manage updates yourself */
    autoUpdate: boolean;
    /** The completed callback, optional */
    onComplete: () => void;
    /** The loop callback, optional */
    onLoop: () => void;
    /** The frame callback, optional */
    onFrameChange: (currentFrame: number) => void;
}

/**
 * Runtime object to play animated GIFs. This object is similar to an AnimatedSprite.
 * It support playback (seek, play, stop) as well as animation speed and looping.
 * @memberof PIXI.gif
 * @see Thanks to {@link https://github.com/matt-way/gifuct-js/ gifuct-js}
 */
class AnimatedGIF extends Sprite
{
    /**
     * Default options for all AnimatedGIF objects.
     * @property [scaleMode=SCALE_MODES.LINEAR] {SCALE_MODES} - Scale mode to use for the texture.
     * @property [loop=true] {boolean} - To enable looping.
     * @property [animationSpeed=1] {number} - Speed of the animation.
     * @property [autoUpdate=true] {boolean} - Set to `false` to manage updates yourself.
     * @property [autoPlay=true] {boolean} - To start playing right away.
     * @property [onComplete=null] {function} - The completed callback, optional.
     * @property [onLoop=null] {function} - The loop callback, optional.
     * @property [onFrameChange=null] {function} - The frame callback, optional.
     */
    public static defaultOptions: AnimatedGIFOptions = {
        scaleMode: SCALE_MODES.LINEAR,
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
    public animationSpeed: number;

    /**
     * Whether or not the animate sprite repeats after playing.
     * @default true
     */
    public loop: boolean;

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
    public readonly duration: number;

    /** Whether to play the animation after constructing. */
    public readonly autoPlay: boolean;

    /** Collection of frame to render. */
    private _frames: FrameObject[];

    /** Drawing context reference. */
    private _context: CanvasRenderingContext2D;

    /** Dirty means the image needs to be redrawn. Set to `true` to force redraw. */
    public dirty: boolean;

    /** The current frame number (zero-based index). */
    private _currentFrame: number;

    /** `true` uses PIXI.Ticker.shared to auto update animation time.*/
    private _autoUpdate: boolean;

    /** `true` if the instance is currently connected to PIXI.Ticker.shared to auto update animation time. */
    private _isConnectedToTicker: boolean;

    /** If animation is currently playing. */
    private _playing: boolean;

    /** Current playback position in milliseconds. */
    private _currentTime: number;

    /**
     * Create an animated GIF animation from a GIF image's ArrayBuffer. The easiest way to get
     * the buffer is to use the Loader.
     * @example
     * const loader = new PIXI.Loader();
     * loader.add('myFile', 'file.gif');
     * loader.load((loader, resources) => {
     *    const gif = resources.myFile.animation;
     *    // add to the stage...
     * });
     * @param buffer - GIF image arraybuffer from loader.
     * @param options - Options to use.
     * @returns
     */
    static fromBuffer(buffer: ArrayBuffer, options?: Partial<AnimatedGIFOptions>): AnimatedGIF
    {
        if (!buffer || buffer.byteLength === 0)
        {
            throw new Error('Invalid buffer');
        }

        const gif = parseGIF(buffer);
        const gifFrames = decompressFrames(gif, true);
        const frames: FrameObject[] = [];

        // Temporary canvases required for compositing frames
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const patchCanvas = document.createElement('canvas');
        const patchContext = patchCanvas.getContext('2d');

        canvas.width = gifFrames[0].dims.width;
        canvas.height = gifFrames[0].dims.height;

        let time = 0;

        // Precompute each frame and store as ImageData
        for (let i = 0; i < gifFrames.length; i++)
        {
            const { disposalType, delay, patch, dims: { width, height, left, top } } = gifFrames[i];

            patchCanvas.width = width;
            patchCanvas.height = height;
            patchContext.clearRect(0, 0, width, height);
            const patchData = patchContext.createImageData(width, height);

            patchData.data.set(patch);
            patchContext.putImageData(patchData, 0, 0);

            if (disposalType === 2)
            {
                context.clearRect(0, 0, width, height);
            }
            context.drawImage(patchCanvas, left, top);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

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

        return new AnimatedGIF(frames, options);
    }

    /**
     * @param buffer - Data of the GIF image.
     * @param options - Options for the AnimatedGIF
     * @param [options.scaleMode=SCALE_MODES.LINEAR] - How to scale the image.
     * @param [options.loop=true] - Whether to loop the animation.
     * @param [options.animationSpeed=1] - The speed that the animation will play at.
     * @param [options.autoPlay=true] - Whether to start playing the animation right away.
     * @param [options.autoUpdate=true] - Whether to use PIXI.Ticker.shared to auto update animation time.
     * @param [options.onComplete=null] - Function to call when the animation finishes playing.
     * @param [options.onFrameChange=null] - Function to call when the frame changes.
     * @param [options.onLoop=null] - Function to call when the animation loops.
     */
    constructor(frames: FrameObject[], options?: Partial<AnimatedGIFOptions>)
    {
        // Get the options, apply defaults
        const { scaleMode, ...rest } = Object.assign({},
            AnimatedGIF.defaultOptions,
            options
        );

        // Create the texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = frames[0].imageData.width;
        canvas.height = frames[0].imageData.height;

        super(Texture.from(canvas, { scaleMode }));

        this.duration = frames[frames.length - 1].end;
        this._frames = frames;
        this._context = context;
        this._playing = false;
        this._currentTime = 0;
        this._isConnectedToTicker = false;
        Object.assign(this, rest);

        // Draw the first frame
        this.currentFrame = 0;
        if (this.autoPlay)
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

        const elapsed = this.animationSpeed * deltaTime / settings.TARGET_FPMS;
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
        const { imageData } = this._frames[this._currentFrame];

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
        this._currentTime = this._frames[value].start;
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
        this._context = null;
        this._frames = null;
        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;
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
            onComplete: this.onComplete,
            onFrameChange: this.onFrameChange,
            onLoop: this.onLoop,
        });
    }
}

export { AnimatedGIF };
export type { AnimatedGIFOptions };

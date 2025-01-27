import { decompressFrames, type ParsedFrame, parseGIF } from 'gifuct-js';
import { DOMAdapter } from '../environment/adapter';
import { CanvasSource } from '../rendering/renderers/shared/texture/sources/CanvasSource';
import { Texture } from '../rendering/renderers/shared/texture/Texture';

/**
 * Represents a single frame of a GIF. Includes image and timing data.
 * @memberof gif
 */
interface GifFrame
{
    /** Image data for the current frame */
    texture: Texture<CanvasSource>;
    /** The start of the current frame, in milliseconds */
    start: number;
    /** The end of the current frame, in milliseconds */
    end: number;
}

/**
 * Options when constructing from buffer
 * @memberof gif
 */
interface GifBufferOptions
{
    /** FPS to use when the GIF animation doesn't define any delay between frames */
    fps: number;
}

/**
 * Resource provided to GifSprite instances. This is very similar to using a shared
 * Texture between Sprites. This source contains all the frames and animation needed
 * to support playback.
 * @memberof gif
 */
class GifSource
{
    /** Width of the animation */
    public readonly width: number;

    /** Height of the animation */
    public readonly height: number;

    /** The total time to play the animation in milliseconds */
    public readonly duration: number;

    /** Animation frames */
    public readonly frames: GifFrame[];

    /** Textures */
    public readonly textures: Texture<CanvasSource>[];

    /** Total number of frames in the animation */
    public readonly totalFrames: number;

    /**
     * @param frames - Array of GifFrame instances.
     */
    constructor(frames: GifFrame[])
    {
        // #if _DEBUG
        if (!frames || !frames.length) throw new Error('Invalid frames');
        // #endif

        // All frames are the same size, get the first frame's size
        const [{ texture: { width, height } }] = frames;

        this.width = width;
        this.height = height;
        this.frames = frames;
        this.textures = this.frames.map((frame) => frame.texture);
        this.totalFrames = this.frames.length;
        this.duration = this.frames[this.totalFrames - 1].end;
    }

    /** Destroy animation data and don't use after this */
    public destroy()
    {
        for (const texture of this.textures)
        {
            texture.destroy(true);
        }
        for (const frame of this.frames)
        {
            frame.texture = null;
        }
        this.frames.length = 0;
        this.textures.length = 0;
        Object.assign(this, {
            frames: null,
            textures: null,
            width: 0,
            height: 0,
            duration: 0,
            totalFrames: 0,
        });
    }

    /**
     * Create an animated GIF animation from a GIF image's ArrayBuffer. The easiest way to get
     * the buffer is to use Assets.
     * @example
     * import { GifSource, GifSprite } from 'pixi.js/gif';
     *
     * const buffer = await fetch('./file.gif').then(res => res.arrayBuffer());
     * const source = GifSource.from(buffer);
     * const sprite = new GifSprite(source);
     * @param buffer - GIF image arraybuffer from Assets.
     * @param options - Optional options to use when building from buffer.
     */
    public static from(buffer: ArrayBuffer, options?: GifBufferOptions): GifSource
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
        const frames: GifFrame[] = [];
        const animWidth = gif.lsd.width;
        const animHeight = gif.lsd.height;

        // Temporary canvases required for compositing frames
        const canvas = DOMAdapter.get().createCanvas(animWidth, animHeight);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const patchCanvas = DOMAdapter.get().createCanvas();
        const patchContext = patchCanvas.getContext('2d');

        let time = 0;
        let previousFrame: ImageData | null = null;

        // Some GIFs have a non-zero frame delay, so we need to calculate the fallback
        const defaultDelay = 1000 / (options?.fps ?? 30);

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

            if (disposalType === 3)
            {
                previousFrame = context.getImageData(0, 0, animWidth, animHeight);
            }

            context.drawImage(patchCanvas as CanvasImageSource, left, top);
            const imageData = context.getImageData(0, 0, animWidth, animHeight);

            if (disposalType === 2)
            {
                context.clearRect(0, 0, animWidth, animHeight);
            }
            else if (disposalType === 3)
            {
                context.putImageData(previousFrame as ImageData, 0, 0);
            }

            // Create new texture
            const resource = DOMAdapter.get().createCanvas(
                imageData.width,
                imageData.height
            ) as HTMLCanvasElement;
            const resourceContext = resource.getContext('2d');

            resourceContext.putImageData(imageData, 0, 0);

            frames.push({
                start: time,
                end: time + delay,
                texture: new Texture({
                    source: new CanvasSource({
                        resource,
                    }),
                }),
            });
            time += delay;
        }

        // clear the canvases
        canvas.width = canvas.height = 0;
        patchCanvas.width = patchCanvas.height = 0;

        return new GifSource(frames);
    }
}

export { GifBufferOptions, GifFrame, GifSource };

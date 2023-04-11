import { extensions, ExtensionType, Rectangle, RenderTexture, utils } from '@pixi/core';

import type { ExtensionMetadata, ICanvas, ISystem, Renderer } from '@pixi/core';
import type { DisplayObject } from '@pixi/display';

const TEMP_RECT = new Rectangle();

export interface IExtract
{
    image(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<HTMLImageElement>;
    base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<string>;
    bitmap(target?: DisplayObject | RenderTexture, frame?: Rectangle): Promise<ImageBitmap>;
    canvas<T extends boolean = false>(target?: DisplayObject | RenderTexture, frame?: Rectangle, async?: T):
    T extends true ? Promise<ICanvas> : ICanvas;
    pixels<T extends boolean>(target?: DisplayObject | RenderTexture, frame?: Rectangle, async?: T):
    T extends true ? Promise<Uint8Array | Uint8ClampedArray> : Uint8Array | Uint8ClampedArray;
}

type PixelData<T extends Uint8Array | Uint8ClampedArray> = {
    pixels: T,
    width: number,
    height: number,
    minX?: number,
    minY?: number,
    maxX?: number,
    maxY?: number,
    flippedY?: boolean,
    premultipliedAlpha?: boolean
};

/**
 * This class provides renderer-specific plugins for exporting content from a renderer.
 * For instance, these plugins can be used for saving an Image, Canvas element or for exporting the raw image data (pixels).
 *
 * Do not instantiate these plugins directly. It is available from the `renderer.extract` property.
 * @example
 * import { Application, Graphics } from 'pixi.js';
 *
 * // Create a new application (extract will be auto-added to renderer)
 * const app = new Application();
 *
 * // Draw a red circle
 * const graphics = new Graphics()
 *     .beginFill(0xFF0000)
 *     .drawCircle(0, 0, 50);
 *
 * // Render the graphics as an HTMLImageElement
 * const image = await app.renderer.extract.image(graphics);
 * document.body.appendChild(image);
 * @memberof PIXI
 */

export class Extract implements ISystem, IExtract
{
    /**
     * Default maximum idle frames before temporary arrays/buffers
     * used by async extraction is destroyed by garbage collection.
     * @static
     * @default 3600
     */
    public static defaultMaxIdle = 60 * 60;

    /**
     * Default frames between two garbage collections.
     * @static
     * @default 600
     */
    public static defaultCheckCountMax = 60 * 10;

    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'extract',
        type: ExtensionType.RendererSystem,
    };

    private renderer: Renderer | null;

    /**
     * Frame count since started.
     * @readonly
     */
    private _count: number;

    /**
     * Frame count since last garbage collection.
     * @readonly
     */
    private _checkCount: number;

    /**
     * Maximum idle frames before an temporary array/buffer is destroyed by garbage collection.
     * @see PIXI.Extract.defaultMaxIdle
     */
    private _maxIdle: number;

    /**
     * Frames between two garbage collections.
     * @see PIXI.Extract.defaultCheckCountMax
     */
    private _checkCountMax: number;

    private _arrayPool: { [arraySize: number]: { object: Uint8Array, touched: number }[] };
    private _bufferPool: { [bufferSize: number]: { object: WebGLBuffer, touched: number }[] };

    private _worker: ExtractWorker | undefined;

    private get worker(): ExtractWorker
    {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this._worker ??= new ExtractWorker();

        return this._worker;
    }

    /**
     * @param renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        this._count = 0;
        this._checkCount = 0;
        this._maxIdle = Extract.defaultMaxIdle;
        this._checkCountMax = Extract.defaultCheckCountMax;
        this._worker = undefined;
        this._arrayPool = {};
        this._bufferPool = {};
    }

    protected contextChange(): void
    {
        this._arrayPool = {};
        this._bufferPool = {};
    }

    protected postrender(): void
    {
        if (!this.renderer?.objectRenderer.renderingToScreen)
        {
            return;
        }

        this._count++;
        this._checkCount++;

        if (this._checkCount > this._checkCountMax)
        {
            this._checkCount = 0;

            const olderThan = this._count - this._maxIdle;

            this._deleteArrays(olderThan);
            this._deleteBuffers(olderThan);
        }
    }

    /**
     * Will return a HTML Image of the target
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @param frame - The frame the extraction is restricted to.
     * @returns - HTML Image of the target
     */
    public async image(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(target, format, quality, frame);

        return image;
    }

    /**
     * Will return a base64 encoded string of this target. It works by calling
     *  `Extract.getCanvas` and then running toDataURL on that.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @param frame - The frame the extraction is restricted to.
     * @returns - A base64 encoded string of the texture.
     */
    public async base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<string>
    {
        return this._extract(target, frame, 'base64', format, quality);
    }

    /**
     * Creates an ImageBitmap from the target.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns - One-dimensional array containing the pixel data of the entire texture
     */
    public bitmap(target?: DisplayObject | RenderTexture, frame?: Rectangle): Promise<ImageBitmap>
    {
        return this._extract(target, frame, 'bitmap');
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @param {boolean} [async=false] - Perform the extraction asynchronously?
     * @returns {ICanvas | Promise<ICanvas>}- A Canvas element with the texture rendered on.
     */
    public canvas<T extends boolean = false>(target?: DisplayObject | RenderTexture, frame?: Rectangle, async?: T):
    T extends true ? Promise<ICanvas> : ICanvas
    {
        if (async)
        {
            return this._extract(target, frame, 'canvas') as any;
        }

        const { pixels, width, height, flippedY } = this._rawPixels(target, frame);

        if (flippedY)
        {
            Extract._flipY(pixels, width, height);
        }

        Extract._unpremultiplyAlpha(pixels);

        const canvasBuffer = new utils.CanvasRenderTarget(width, height, 1);
        const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer), width, height);

        canvasBuffer.context.putImageData(imageData, 0, 0);

        return canvasBuffer.canvas as any;
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @param {boolean} [async=false] - Perform the extraction asynchronously?
     * @returns {Uint8Array | Promise<Uint8Array>} - One-dimensional array containing the pixel data of the entire texture
     */
    public pixels<T extends boolean = false>(target?: DisplayObject | RenderTexture, frame?: Rectangle, async?: T):
    T extends true ? Promise<Uint8Array> : Uint8Array
    {
        if (async)
        {
            return this._extract(target, frame, 'pixels') as any;
        }

        const { pixels, width, height, flippedY } = this._rawPixels(target, frame);

        if (flippedY)
        {
            Extract._flipY(pixels, width, height);
        }

        Extract._unpremultiplyAlpha(pixels);

        return pixels as any;
    }

    private _rawPixels(target?: DisplayObject | RenderTexture, frame?: Rectangle): PixelData<Uint8Array>
    {
        return this._extract<undefined>(target, frame);
    }

    private _extract<F extends undefined | 'base64' | 'bitmap' | 'canvas' | 'pixels'>(target?: DisplayObject | RenderTexture,
        frame?: Rectangle, func?: F, ...args: F extends 'base64' ? [type?: string, quality?: number] : []):
        F extends undefined ? PixelData<Uint8Array> : F extends 'base64' ? Promise<string> : F extends 'bitmap'
            ? Promise<ImageBitmap> : F extends 'canvas' ? Promise<ICanvas> : F extends 'pixels' ? Promise<Uint8Array> : never
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('Extract has already been destroyed');
        }

        let resolution;
        let flippedY = false;
        let premultipliedAlpha = false;
        let renderTexture: RenderTexture | undefined;
        let generated = false;

        if (target)
        {
            if (target instanceof RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = renderer.generateTexture(target, {
                    resolution: renderer.resolution,
                    multisample: renderer.multisample
                });
                generated = true;
            }
        }

        if (renderTexture)
        {
            resolution = renderTexture.baseTexture.resolution;
            frame ??= renderTexture.frame;
            flippedY = false;
            premultipliedAlpha = true;

            if (!generated)
            {
                renderer.renderTexture.bind(renderTexture);

                const fbo = renderTexture.framebuffer.glFramebuffers[renderer.CONTEXT_UID];

                if (fbo.blitFramebuffer)
                {
                    renderer.framebuffer.bind(fbo.blitFramebuffer);
                }
            }
        }
        else
        {
            resolution = renderer.resolution;
            frame ??= renderer.screen;
            flippedY = true;
            premultipliedAlpha = true;
            renderer.renderTexture.bind();
        }

        const baseFrame = TEMP_RECT.copyFrom(renderTexture?.frame ?? renderer.screen);

        baseFrame.x = Math.round(baseFrame.x * resolution);
        baseFrame.y = Math.round(baseFrame.y * resolution);
        baseFrame.width = Math.round(baseFrame.width * resolution);
        baseFrame.height = Math.round(baseFrame.height * resolution);

        const x = Math.round(frame.x * resolution);
        const y = Math.round(frame.y * resolution);
        const width = Math.round(frame.width * resolution);
        const height = Math.round(frame.height * resolution);
        const minX = Math.max(0, baseFrame.left - x);
        const minY = Math.max(0, baseFrame.top - y);
        const maxX = Math.min(width, baseFrame.right - x);
        const maxY = Math.min(height, baseFrame.bottom - y);
        const pixelsSize = 4 * width * height;
        const { gl, CONTEXT_UID } = renderer;

        if (func === undefined)
        {
            const pixels = new Uint8Array(pixelsSize);

            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            return { pixels, width, height, minX, minY, maxX, maxY, flippedY, premultipliedAlpha } as any;
        }

        const bufferSize = utils.nextPow2(pixelsSize);
        let pixels: Uint8Array;
        let tempPixels: Uint8Array | undefined;

        if (func === 'pixels')
        {
            pixels = new Uint8Array(pixelsSize);
        }
        else
        {
            tempPixels = this._getArray(bufferSize);
            pixels = tempPixels;
        }

        let readPixels: Promise<PixelData<Uint8Array>>;

        if (renderer.context.webGLVersion === 1)
        {
            readPixels = new Promise((resolve) =>
            {
                gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                resolve({ pixels, width, height, minX, minY, maxX, maxY, flippedY, premultipliedAlpha });
            });
        }
        else
        {
            const buffer = this._getBuffer(bufferSize);

            readPixels = new Promise<void>((resolve, reject) =>
            {
                gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, 0);
                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

                const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

                if (!sync)
                {
                    reject(new Error('gl.fenceSync failed'));

                    return;
                }

                const wait = (flags = 0) =>
                {
                    if (!this.renderer)
                    {
                        throw new Error('Extract has already been destroyed');
                    }

                    if (this.renderer.CONTEXT_UID !== CONTEXT_UID)
                    {
                        throw new Error('WebGL context has changed');
                    }

                    const status = gl.clientWaitSync(sync, flags, 0);

                    if (status === gl.TIMEOUT_EXPIRED)
                    {
                        setTimeout(wait, 1);
                    }
                    else
                    {
                        gl.deleteSync(sync);

                        if (status === gl.WAIT_FAILED)
                        {
                            reject(new Error('gl.clientWaitSync returned WAIT_FAILED'));
                        }
                        else
                        {
                            resolve();
                        }
                    }
                };

                setTimeout(wait, 0, gl.SYNC_FLUSH_COMMANDS_BIT);
            }).then(() =>
            {
                if (!this.renderer)
                {
                    throw new Error('Extract has already been destroyed');
                }

                if (this.renderer.CONTEXT_UID !== CONTEXT_UID)
                {
                    throw new Error('WebGL context has changed');
                }

                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
                gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixels, 0, pixelsSize);
                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

                return { pixels, width, height, minX, minY, maxX, maxY, flippedY, premultipliedAlpha };
            }).finally(() =>
            {
                if (this.renderer?.CONTEXT_UID === CONTEXT_UID)
                {
                    this._returnBuffer(buffer, bufferSize);
                }
            });
        }

        return readPixels.finally(() =>
        {
            if (generated)
            {
                renderTexture?.destroy(true);
            }
        }).then(
            async (data) => (this.worker as any)[func](data, ...args)
        ).finally(() =>
        {
            if (this.renderer?.CONTEXT_UID === CONTEXT_UID)
            {
                this._returnArray(tempPixels);
            }
        }) as any;
    }

    /** Destroys the extract. */
    public destroy(): void
    {
        this._worker?.terminate();
        this._worker = undefined;
        this._deleteArrays(this._count + 1);
        this._deleteBuffers(this._count + 1);
        this._arrayPool = {};
        this._bufferPool = {};
        this.renderer = null;
    }

    private static _flipY(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number): void
    {
        const w = width << 2;
        const h = height >> 1;
        const temp = new Uint8Array(w);

        for (let y = 0; y < h; y++)
        {
            const t = y * w;
            const b = (height - y - 1) * w;

            temp.set(pixels.subarray(t, t + w));
            pixels.copyWithin(t, b, b + w);
            pixels.set(temp, b);
        }
    }

    private static _unpremultiplyAlpha(pixels: Uint8Array | Uint8ClampedArray): void
    {
        if (pixels instanceof Uint8ClampedArray)
        {
            pixels = new Uint8Array(pixels.buffer);
        }

        const n = pixels.length;

        for (let i = 0; i < n; i += 4)
        {
            const alpha = pixels[i + 3];

            if (alpha !== 0)
            {
                const a = 255.001 / alpha;

                pixels[i] = (pixels[i] * a) + 0.5;
                pixels[i + 1] = (pixels[i + 1] * a) + 0.5;
                pixels[i + 2] = (pixels[i + 2] * a) + 0.5;
            }
        }
    }

    private _getArray(size: number): Uint8Array
    {
        const entry = (this._arrayPool[size] ??= []).pop();
        let array: Uint8Array;

        if (entry)
        {
            array = entry.object;
        }
        else
        {
            array = new Uint8Array(size);
        }

        return array;
    }

    private _returnArray(array?: Uint8Array): void
    {
        if (!array?.length)
        {
            return;
        }

        this._arrayPool[array.length].push({ object: array, touched: this._count });
    }

    private _deleteArrays(olderThan: number): void
    {
        for (const size in this._arrayPool)
        {
            const arrays = this._arrayPool[size];

            for (let i = arrays.length - 1; i >= 0; i--)
            {
                const array = arrays[i];

                if (array.touched < olderThan)
                {
                    arrays[i] = arrays[arrays.length - 1];
                    arrays.length--;
                }
            }
        }
    }

    private _getBuffer(size: number): WebGLBuffer
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('Extract has already been destroyed');
        }

        const gl = renderer.gl;
        const entry = (this._bufferPool[size] ??= []).pop();
        let buffer: WebGLBuffer | null;

        if (entry)
        {
            buffer = entry.object;
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
        }
        else
        {
            buffer = gl.createBuffer();

            if (!buffer)
            {
                throw new Error('gl.createBuffer failed');
            }

            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, size, gl.DYNAMIC_READ);
        }

        return buffer;
    }

    private _returnBuffer(buffer: WebGLBuffer, size: number)
    {
        this._bufferPool[size].push({ object: buffer, touched: this._count });
    }

    private _deleteBuffers(olderThan: number)
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('Extract has already been destroyed');
        }

        const gl = renderer.gl;

        for (const size in this._bufferPool)
        {
            const buffers = this._bufferPool[size];

            for (let i = buffers.length - 1; i >= 0; i--)
            {
                const buffer = buffers[i];

                if (buffer.touched < olderThan)
                {
                    gl.deleteBuffer(buffer.object);

                    buffers[i] = buffers[buffers.length - 1];
                    buffers.length--;
                }
            }
        }
    }
}

extensions.add(Extract);

type ExtractWorkerTask<T extends Uint8Array | Uint8ClampedArray, R extends string | ImageBitmap | OffscreenCanvas | T> = {
    data: PixelData<T>,
    resolve: (result: R) => void,
    reject: (error: Error) => void
};

type ExtractWorkerResult<T extends Uint8Array | Uint8ClampedArray, R extends string | ImageBitmap | OffscreenCanvas | T> = {
    id: number,
    pixels: T,
    result?: R,
    error?: string,
};

class ExtractWorker extends Worker
{
    private static objectURL: string | undefined;
    private static objectURLRefCount = 0;

    private static readonly isOffscreenCanvasSupported = typeof OffscreenCanvas !== 'undefined'
        && !!new OffscreenCanvas(0, 0).getContext('bitmaprenderer');

    private static readonly isSubworker = 'WorkerGlobalScope' in globalThis
        && globalThis instanceof (globalThis as any).WorkerGlobalScope;

    private _terminated: boolean;

    public get terminated(): boolean
    {
        return this._terminated;
    }

    private readonly tasks: Map<number, ExtractWorkerTask<Uint8Array | Uint8ClampedArray,
    string | ImageBitmap | OffscreenCanvas | Uint8Array | Uint8ClampedArray>>;
    private nextTaskID: number;

    constructor()
    {
        ExtractWorker.objectURL ??= URL.createObjectURL(
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new Blob([EXTRACT_WORKER_SOURCE], { type: 'application/javascript' }));
        ExtractWorker.objectURLRefCount++;

        super(ExtractWorker.objectURL);

        this._terminated = false;
        this.tasks = new Map();
        this.nextTaskID = 0;
        this.onmessage = this._onMessage.bind(this);
    }

    public terminate(): void
    {
        this._terminated = true;
        super.terminate();

        ExtractWorker.objectURLRefCount--;

        if (ExtractWorker.objectURLRefCount === 0)
        {
            URL.revokeObjectURL(ExtractWorker.objectURL as string);
            ExtractWorker.objectURL = undefined;
        }
    }

    private _onMessage<T extends Uint8Array | Uint8ClampedArray, R extends string | ImageBitmap | OffscreenCanvas | T>(
        event: MessageEvent<ExtractWorkerResult<T, R>>): void
    {
        const { id, pixels, result, error } = event.data;
        const task = this.tasks.get(id);

        if (!task)
        {
            throw new Error('ExtractWorker received an unexcepted message');
        }

        this.tasks.delete(id);
        task.data.pixels = pixels;
        task.data.flippedY = false;
        task.data.premultipliedAlpha = false;

        if (error)
        {
            task.reject(new Error(`ExtractWorker encountered an error: ${error}`));
        }
        else
        {
            task.resolve(result ?? pixels);
        }
    }

    private process<T extends Uint8Array | Uint8ClampedArray, F extends 'base64' | 'bitmap' | 'canvas' | 'pixels'>(
        data: PixelData<T>, func: F, ...args: F extends 'base64' ? [type?: string, quality?: number] : []):
        F extends 'base64' ? Promise<string> : F extends 'bitmap' ? Promise<ImageBitmap> : F extends 'canvas'
            ? Promise<OffscreenCanvas> : F extends 'pixels' ? Promise<T> : never
    {
        if (func === 'pixels' && !(data.flippedY || data.premultipliedAlpha))
        {
            return Promise.resolve(data.pixels) as any;
        }

        const taskID = this.nextTaskID++;
        const taskData = { id: taskID, data, func, args };

        return new Promise((resolve, reject) =>
        {
            if (this._terminated)
            {
                reject(new Error('ExtractWorker has been terminated already'));
            }
            else
            {
                this.tasks.set(taskID, { data, resolve, reject });
                this.postMessage(taskData, [data.pixels.buffer]);
            }
        }) as any;
    }

    public async base64(data: PixelData<Uint8Array | Uint8ClampedArray>,
        type = 'image/png', quality?: number): Promise<string>
    {
        if (ExtractWorker.isOffscreenCanvasSupported)
        {
            return this.process(data, 'base64', type, quality);
        }

        const canvas = await this.canvas(data);

        if (canvas.convertToBlob !== undefined)
        {
            const blob = await canvas.convertToBlob({ type, quality });

            return new Promise<string>((resolve, reject) =>
            {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        if (canvas.toBlob !== undefined)
        {
            return new Promise<string>((resolve, reject) =>
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                canvas.toBlob!((blob) =>
                {
                    if (!blob)
                    {
                        reject(new Error('ICanvas.toBlob failed'));

                        return;
                    }

                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }, type, quality);
            });
        }

        if (canvas.toDataURL !== undefined)
        {
            return canvas.toDataURL(type, quality);
        }

        throw new Error('ExtractWorker.base64() requires ICanvas.toDataURL, ICanvas.toBlob, '
            + 'or ICanvas.convertToBlob to be implemented');
    }

    public async bitmap(data: PixelData<Uint8Array | Uint8ClampedArray>): Promise<ImageBitmap>
    {
        if (typeof createImageBitmap === 'undefined')
        {
            throw new Error('createImageBitmap is not supported');
        }

        if (ExtractWorker.isOffscreenCanvasSupported)
        {
            return this.process(data, 'bitmap');
        }

        const pixels = await this.pixels(data);
        const { width, height } = data;
        const size = 4 * width * height;
        const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer, 0, size), width, height);

        return createImageBitmap(imageData);
    }

    public async canvas(data: PixelData<Uint8Array | Uint8ClampedArray>): Promise<ICanvas>
    {
        if (ExtractWorker.isSubworker)
        {
            return this.process(data, 'canvas');
        }

        const pixels = await this.pixels(data);
        const { width, height } = data;
        const canvasBuffer = new utils.CanvasRenderTarget(width, height, 1);
        const size = 4 * width * height;
        const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer, 0, size), width, height);

        canvasBuffer.context.putImageData(imageData, 0, 0);

        return canvasBuffer.canvas;
    }

    public async pixels<T extends Uint8Array | Uint8ClampedArray>(data: PixelData<T>): Promise<T>
    {
        return this.process(data, 'pixels');
    }
}

const EXTRACT_WORKER_SOURCE = `\
/**
 * @param {Uint8Array|Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 */
function flipY(pixels, width, height)
{
    const w = width << 2;
    const h = height >> 1;
    const temp = new Uint8Array(w);

    for (let y = 0; y < h; y++)
    {
        const t = y * w;
        const b = (height - y - 1) * w;

        temp.set(pixels.subarray(t, t + w));
        pixels.copyWithin(t, b, b + w);
        pixels.set(temp, b);
    }
}

/**
 * @param {Uint8Array|Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 */
function unpremultiplyAlpha(pixels, width, height)
{
    if (pixels instanceof Uint8ClampedArray)
    {
        pixels = new Uint8Array(pixels.buffer);
    }

    const n = 4 * width * height;

    for (let i = 0; i < n; i += 4)
    {
        const alpha = pixels[i + 3];

        if (alpha !== 0)
        {
            const a = 255.001 / alpha;

            pixels[i] = (pixels[i] * a) + 0.5;
            pixels[i + 1] = (pixels[i + 1] * a) + 0.5;
            pixels[i + 2] = (pixels[i + 2] * a) + 0.5;
        }
    }
}

/**
 * @param {Uint8Array|Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @param {number} minX
 * @param {number} minY
 * @param {number} maxY
 * @param {number} maxX
 */
function clearOutOfBounds(pixels, width, height, minX, minY, maxX, maxY)
{
    if (minX > maxX || minY > maxY)
    {
        pixels.fill(0, 0, 4 * width * height);
    }
    else
    {
        const w = width << 2;

        pixels.fill(0, 0, w * minY);

        if (minX !== 0 || maxX !== width)
        {
            const l = minX << 2;
            const r = maxX << 2;
            let k = w * minY;

            for (let y = minY; y < maxY; y++)
            {
                pixels.fill(0, k, k + l);
                pixels.fill(0, k + r, k + w);
                k += w;
            }
        }

        pixels.fill(0, w * maxY, w * height);
    }
}

/**
 * @param {Uint8Array|Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @returns {Promise<ImageBitmap>}
 */
async function toBitmap(pixels, width, height)
{
    const size = 4 * width * height;
    const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer, 0, size), width, height);

    return createImageBitmap(imageData);
}

/**
 * @param {Uint8Array|Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @param {string} [type]
 * @param {number} [quality]
 * @returns {Promise<string>}
 */
async function toBase64(pixels, width, height, type, quality)
{
    const bitmap = await toBitmap(pixels, width, height);
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('bitmaprenderer');

    context.transferFromImageBitmap(bitmap);
    bitmap.close();

    return canvas.convertToBlob({ type, quality }).then(
        blob => new Promise((resolve, reject) =>
        {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })
    );
}

/**
 * @param {Uint8Array|Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @returns {Promise<OffscreenCanvas>}
 */
async function toCanvas(pixels, width, height)
{
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    const size = 4 * width * height;
    const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer, 0, size), width, height);

    context.putImageData(imageData, 0, 0);

    return canvas;
}

onmessage = function(event)
{
    const { id, data, func, args } = event.data;
    const { pixels, width, height, minX, minY, maxX, maxY, flippedY, premultipliedAlpha } = data;

    setTimeout(async () =>
    {
        try
        {
            let empty = false;

            if (minX !== undefined)
            {
                if (minX > maxX || minY > maxY)
                {
                    empty = true;
                }

                clearOutOfBounds(pixels, width, height, minX, minY, maxX, maxY);
            }

            if (flippedY && !empty)
            {
                flipY(pixels, width, height);
            }

            if (premultipliedAlpha && !empty)
            {
                unpremultiplyAlpha(pixels, width, height);
            }

            if (func === 'base64')
            {
                const result = await toBase64(pixels, width, height, ...args);

                postMessage({ id, pixels, result }, [pixels.buffer]);
            }
            else if (func === 'bitmap')
            {
                const result = await toBitmap(pixels, width, height);

                postMessage({ id, pixels, result }, [pixels.buffer, result]);
            }
            else if (func === 'canvas')
            {
                const result = await toCanvas(pixels, width, height);

                postMessage({ id, pixels, result }, [pixels.buffer, result]);
            }
            else
            {
                postMessage({ id, pixels }, [pixels.buffer]);
            }
        }
        catch (e)
        {
            postMessage({ id, pixels, error: e.message }, [pixels.buffer]);
        }
    }, 0);
};
`;

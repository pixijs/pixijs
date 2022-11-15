import canvasModule from 'canvas';
import createGLContext from 'gl';
import { utils } from '@pixi/core';

import type {
    CanvasRenderingContext2D, JpegConfig, NodeCanvasRenderingContext2DSettings, PdfConfig, PngConfig,
} from 'canvas';
import type {
    STACKGL_resize_drawingbuffer, // eslint-disable-line camelcase
    StackGLExtension,
} from 'gl';
import type { ContextIds, ContextSettings, ICanvas, ICanvasRenderingContext2DSettings } from '@pixi/core';

const { Canvas, Image, createImageData } = canvasModule;

/** Obtain the parameters of a function type in a tuple, except the first one */
type ParametersExceptFirst<T extends (...args: any) => any> = T extends (arg0: any, ...args: infer P) => any ? P : never;

/**
 * A node implementation of a canvas element.
 * Uses node-canvas and gl packages to provide the same
 * functionality as a normal HTMLCanvasElement.
 * @class
 * @memberof PIXI
 */
export class NodeCanvasElement implements ICanvas
{
    /** Style of the canvas. */
    public style: Record<string, any>;

    private _canvas: canvasModule.Canvas;
    private _event: utils.EventEmitter;
    private _contextType?: ContextIds;
    private _ctx?: CanvasRenderingContext2D;
    private _gl?: WebGLRenderingContext & StackGLExtension;
    private _glExtensions?: {
        resizeDrawingBuffer?: STACKGL_resize_drawingbuffer; // eslint-disable-line camelcase
    };

    constructor(width = 1, height = 1, type?: 'image' | 'pdf' | 'svg')
    {
        this._canvas = new Canvas(width, height, type);
        this._event = new utils.EventEmitter();
        this.style = {};
    }

    get width()
    {
        return this._canvas.width;
    }

    set width(value)
    {
        this._glExtensions?.resizeDrawingBuffer?.resize(value, this.height);
        this._canvas.width = value;
    }

    get height()
    {
        return this._canvas.height;
    }

    set height(value)
    {
        this._glExtensions?.resizeDrawingBuffer?.resize(this.width, value);
        this._canvas.height = value;
    }

    get clientWidth()
    {
        return this._canvas.width;
    }

    get clientHeight()
    {
        return this._canvas.height;
    }

    getContext(
        contextId: '2d',
        options?: ICanvasRenderingContext2DSettings | NodeCanvasRenderingContext2DSettings,
    ): CanvasRenderingContext2D | null;
    getContext(
        contextId: 'bitmaprenderer',
        options?: ImageBitmapRenderingContextSettings | NodeCanvasRenderingContext2DSettings,
    ): null;
    getContext(
        contextId: 'webgl' | 'experimental-webgl',
        options?: WebGLContextAttributes | NodeCanvasRenderingContext2DSettings,
    ): WebGLRenderingContext | null;
    getContext(
        contextId: 'webgl2' | 'experimental-webgl2',
        options?: WebGLContextAttributes | NodeCanvasRenderingContext2DSettings,
    ): null;
    getContext(
        type: ContextIds,
        options?: ContextSettings | NodeCanvasRenderingContext2DSettings,
    ): CanvasRenderingContext2D | WebGLRenderingContext | null
    {
        switch (type)
        {
            case '2d':
            {
                if (this._contextType && this._contextType !== '2d') return null;
                if (this._ctx) return this._ctx;

                const ctx = this._canvas.getContext('2d', options as NodeCanvasRenderingContext2DSettings);

                this._patch2DContext(ctx);

                this._ctx = ctx;
                this._contextType = '2d';

                return ctx;
            }
            case 'webgl':
            case 'experimental-webgl':
            {
                if (this._contextType && this._contextType !== 'webgl') return null;
                if (this._gl) return this._gl;

                const { width, height } = this;

                const ctx = this._canvas.getContext('2d', options as NodeCanvasRenderingContext2DSettings);
                const gl = createGLContext(width, height, options as WebGLContextAttributes);

                this._patchGLContext(gl);

                this._ctx = ctx;
                this._gl = gl;
                this._glExtensions = {
                    resizeDrawingBuffer: gl.getExtension('STACKGL_resize_drawingbuffer'),
                };
                this._contextType = 'webgl';

                return gl;
            }
            default: return null;
        }
    }

    /**
     * For image canvases, encodes the canvas as a PNG. For PDF canvases,
     * encodes the canvas as a PDF. For SVG canvases, encodes the canvas as an
     * SVG.
     */
    toBuffer(cb: (err: Error | null, result: Buffer) => void): void;
    toBuffer(cb: (err: Error | null, result: Buffer) => void, mimeType: 'image/png', config?: PngConfig): void;
    toBuffer(cb: (err: Error | null, result: Buffer) => void, mimeType: 'image/jpeg', config?: JpegConfig): void;
    /**
     * For image canvases, encodes the canvas as a PNG. For PDF canvases,
     * encodes the canvas as a PDF. For SVG canvases, encodes the canvas as an
     * SVG.
     */
    toBuffer(): Buffer;
    toBuffer(mimeType: 'image/png', config?: PngConfig): Buffer;
    toBuffer(mimeType: 'image/jpeg', config?: JpegConfig): Buffer;
    toBuffer(mimeType: 'application/pdf', config?: PdfConfig): Buffer;
    /**
     * Returns the unencoded pixel data, top-to-bottom. On little-endian (most)
     * systems, the array will be ordered BGRA; on big-endian systems, it will
     * be ARGB.
     */
    toBuffer(mimeType: 'raw'): Buffer;
    /**
     * Returns a buffer of the canvas contents.
     * @param args - the arguments to pass to the toBuffer method
     */
    toBuffer(...args: any): Buffer | void
    {
        this._updateContext();

        return this._canvas.toBuffer(...args as Parameters<typeof canvasModule.Canvas.prototype.toBuffer>);
    }

    /** Defaults to PNG image. */
    toDataURL(): string;
    toDataURL(mimeType: 'image/png'): string;
    toDataURL(mimeType: 'image/jpeg', quality?: number): string;
    /** _Non-standard._ Defaults to PNG image. */
    toDataURL(cb: (err: Error | null, result: string) => void): void;
    /** _Non-standard._ */
    toDataURL(mimeType: 'image/png', cb: (err: Error | null, result: string) => void): void;
    /** _Non-standard._ */
    toDataURL(mimeType: 'image/jpeg', cb: (err: Error | null, result: string) => void): void;
    /** _Non-standard._ */
    toDataURL(mimeType: 'image/jpeg', config: JpegConfig, cb: (err: Error | null, result: string) => void): void;
    /** _Non-standard._ */
    toDataURL(mimeType: 'image/jpeg', quality: number, cb: (err: Error | null, result: string) => void): void;
    /**
     * Returns a base64 encoded string representation of the canvas.
     * @param args - The arguments to pass to the toDataURL method.
     */
    toDataURL(...args: any): string | void
    {
        this._updateContext();

        return this._canvas.toDataURL(...args as Parameters<typeof canvasModule.Canvas.prototype.toDataURL>);
    }

    /**
     * Adds the listener for the specified event.
     * @param type - The type of event to listen for.
     * @param listener - The callback to invoke when the event is fired.
     */
    addEventListener(type: string, listener: (...args: any[]) => void)
    {
        return this._event.addListener(type, listener);
    }

    /**
     * Removes the listener for the specified event.
     * @param type - The type of event to listen for.
     * @param listener - The callback to invoke when the event is fired.
     */
    removeEventListener(type: string, listener: (...args: any[]) => void)
    {
        if (listener)
        {
            return this._event.removeListener(type, listener);
        }

        return this._event.removeAllListeners(type);
    }

    /**
     * Dispatches the specified event.
     * @param event - The event to emit.
     * @param event.type - The type of event.
     */
    dispatchEvent(event: {type: string, [key: string]: any})
    {
        event.target = this;

        return this._event.emit(event.type, event);
    }

    /** Read canvas pixels as Uint8Array. */
    private _getPixels(): Uint8Array
    {
        switch (this._contextType)
        {
            case '2d':
            {
                const { width, height, _ctx: ctx } = this;

                const imageData = ctx.getImageData(0, 0, width, height);
                const { buffer, byteOffset, length } = imageData.data;

                return new Uint8Array(buffer, byteOffset, length);
            }
            case 'webgl':
            {
                const { width, height, _gl: gl } = this;

                const lineByteCount = 4 * width;
                const pixels = new Uint8Array(height * lineByteCount);

                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                const tmp = new Uint8Array(lineByteCount);

                // Reverse row order
                for (let srcRow = 0; srcRow < height >> 1; srcRow++)
                {
                    const dstRow = height - srcRow - 1;
                    const srcIndex = srcRow * lineByteCount;
                    const dstIndex = dstRow * lineByteCount;
                    const src = pixels.subarray(srcIndex, srcIndex + lineByteCount);
                    const dst = pixels.subarray(dstIndex, dstIndex + lineByteCount);

                    tmp.set(dst);
                    dst.set(src);
                    src.set(tmp);
                }

                return pixels;
            }
            default:
            {
                throw new Error('getContext() has not been called');
            }
        }
    }

    /** Copy pixels from GL context to 2D context. */
    private _updateContext()
    {
        if (this._contextType === 'webgl')
        {
            const { width, height, _ctx: ctx } = this;

            const pixels = this._getPixels();
            const imageData = createImageData(new Uint8ClampedArray(pixels.buffer), width, height);

            ctx.putImageData(imageData, 0, 0);
        }
    }

    /**
     * Patch the 2D context.
     * @param ctx - The 2D context.
     */
    private _patch2DContext(ctx: CanvasRenderingContext2D)
    {
        const _drawImage = ctx.drawImage;

        ctx.drawImage = function drawImage(image: any, ...args: any)
        {
            if (image instanceof NodeCanvasElement)
            {
                image._updateContext();
                image = image._canvas;
            }

            return _drawImage.call(this, image, ...args as ParametersExceptFirst<typeof _drawImage>);
        };

        const _createPattern = ctx.createPattern;

        ctx.createPattern = function createPattern(image: any, ...args: any)
        {
            if (image instanceof NodeCanvasElement)
            {
                image._updateContext();
                image = image._canvas;
            }

            return _createPattern.call(this, image, ...args as ParametersExceptFirst<typeof _createPattern>);
        };
    }

    /**
     * Patch the GL context.
     * @param gl - The GL context.
     */
    private _patchGLContext(gl: WebGLRenderingContext & StackGLExtension)
    {
        const _getUniformLocation = gl.getUniformLocation;

        type Program = WebGLProgram & { _uniforms: any[] };
        // Temporary fix https://github.com/stackgl/headless-gl/issues/170
        gl.getUniformLocation = function getUniformLocation(program: Program, name)
        {
            if (program._uniforms && !(/\[\d+\]$/).test(name))
            {
                const reg = new RegExp(`${name}\\[\\d+\\]$`);

                for (let i = 0; i < program._uniforms.length; i++)
                {
                    const _name = program._uniforms[i].name;

                    if (reg.test(_name))
                    {
                        name = _name;
                    }
                }
            }

            return _getUniformLocation.call(this, program, name);
        };

        /**
         * Convert TexImageSource argument for GL context.
         * @param source
         */
        function convertTexImageSource(source: any): any
        {
            if (source instanceof NodeCanvasElement)
            {
                source._updateContext();

                return source;
            }
            if (source instanceof Image)
            {
                const { width, height } = source;
                const canvas = new Canvas(width, height);

                canvas.getContext('2d').drawImage(source, 0, 0);

                return source;
            }

            return source;
        }

        const _texImage2D = gl.texImage2D;

        gl.texImage2D = function texImage2D(...args: any)
        {
            args[args.length - 1] = convertTexImageSource(args[args.length - 1]);

            return _texImage2D.apply(this, args);
        };

        const _texSubImage2D = gl.texSubImage2D;

        gl.texSubImage2D = function texSubImage2D(...args: any)
        {
            args[args.length - 1] = convertTexImageSource(args[args.length - 1]);

            return _texSubImage2D.apply(this, args);
        };
    }
}

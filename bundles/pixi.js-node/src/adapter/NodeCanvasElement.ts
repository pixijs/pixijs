/* eslint-disable dot-notation */
/* eslint-disable func-names */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import type { JpegConfig, NodeCanvasRenderingContext2DSettings, PdfConfig, PngConfig } from 'canvas';
import { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import { EventEmitter } from '@pixi/utils';
import createGLContext from 'gl';
import type { ContextIds } from '@pixi/settings';

function putImageData(gl: WebGLRenderingContext, canvas: NodeCanvasElement)
{
    const { width, height } = canvas;

    const ctx = canvas['_ctx'] as CanvasRenderingContext2D;

    const data = ctx.getImageData(0, 0, width, height);

    const pixels = new Uint8Array(width * height * 4);

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    for (let i = 0; i < height; i++)
    {
        for (let j = 0; j < width; j++)
        {
            const col = j;
            const row = height - i - 1;

            for (let k = 0; k < 4; k++)
            {
                const idx = (4 * ((row * width) + col)) + k;
                const idx2 = (4 * ((i * width) + col)) + k;

                data.data[idx] = pixels[idx2];
            }
        }
    }

    ctx.putImageData(data, 0, 0);

    return ctx;
}

type TempCtx = WebGLRenderingContext & {
    canvas: NodeCanvasElement
};

/**
 * A node implementation of a canvas element.
 * Uses node-canvas and gl packages to provide the same
 * functionality as a normal HTMLCanvasElement.
 * @class
 * @memberof PIXI
 */
export class NodeCanvasElement extends Canvas
{
    public style: Record<string, any>;
    private _gl: WebGLRenderingContext;
    private _event: EventEmitter;
    private _contextType: ContextIds;
    private _ctx: CanvasRenderingContext2D | WebGLRenderingContext;

    constructor(width = 1, height = 1, type?: 'image' | 'pdf' | 'svg')
    {
        super(width, height, type);
        this._event = new EventEmitter();
        this.style = {};
    }

    // @ts-expect-error - overriding width to be a getter/setter
    get width()
    {
        return super['width'];
    }

    set width(value)
    {
        if (this._gl)
        {
            const ext = this._gl.getExtension('STACKGL_resize_drawingbuffer');

            ext.resize(value, this.height);
        }
        super['width'] = value;
    }

    // @ts-expect-error - overriding height to be a getter/setter
    get height()
    {
        return super['height'];
    }

    set height(value)
    {
        if (this._gl)
        {
            const ext = this._gl.getExtension('STACKGL_resize_drawingbuffer');

            ext.resize(this.width, value);
        }
        super['height'] = value;
    }

    get clientWidth()
    {
        return super['width'];
    }

    get clientHeight()
    {
        return super['height'];
    }

    /**
     * Internal method to update the context before drawing.
     * @private
     */
    public _updateCtx()
    {
        const gl = this._gl;

        if (gl)
        {
            putImageData(gl, this);
        }

        return this._ctx;
    }

    // @ts-expect-error - overriding getContext
    override getContext(
        type: ContextIds,
        options?: NodeCanvasRenderingContext2DSettings | WebGLContextAttributes
    ): CanvasRenderingContext2D | WebGLRenderingContext
    {
        if (type === 'webgl2') return undefined;
        if (this._contextType && this._contextType !== type) return null;
        if (this._gl) return this._gl;
        this._contextType = type;
        if (type === 'experimental-webgl' || type === 'webgl')
        {
            const { width, height } = this;

            this._ctx = super.getContext('2d', options as NodeCanvasRenderingContext2DSettings);
            const ctx = createGLContext(width, height, options as WebGLContextAttributes) as TempCtx;
            const _getUniformLocation = ctx.getUniformLocation;

            type Program = WebGLProgram & {_uniforms: any[]};
            // Temporary fix https://github.com/stackgl/headless-gl/issues/170
            ctx.getUniformLocation = function (program: Program, name)
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

            (ctx as any).canvas = this as NodeCanvasElement;
            const _texImage2D = ctx.texImage2D;

            ctx.texImage2D = function (...args: any)
            {
                let pixels = args[args.length - 1];

                if (pixels && pixels._image) pixels = pixels._image;
                if (pixels instanceof Image)
                {
                    const canvas = new Canvas(pixels.width, pixels.height);

                    canvas.getContext('2d').drawImage(pixels, 0, 0);
                    args[args.length - 1] = canvas;
                }

                return _texImage2D.apply(this, args);
            };
            this._gl = ctx;

            return this._gl;
        }

        return super.getContext(type, options as NodeCanvasRenderingContext2DSettings);
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
    public toBuffer(...args: any): Buffer
    {
        const gl = this._gl;

        if (gl)
        {
            putImageData(gl, this);
        }

        // @ts-expect-error - overriding toBuffer
        return super.toBuffer(...args);
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
    public toDataURL(...args: any): string
    {
        const gl = this._gl;

        if (gl)
        {
            putImageData(gl, this);
        }

        // @ts-expect-error - overriding toDataURL
        return super.toDataURL(...args);
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
}

const _drawImage = CanvasRenderingContext2D.prototype.drawImage;

// We hack the drawImage method to make it work with our custom Canvas, ensuring that the context is updated before we draw
// eslint-disable-next-line func-names
CanvasRenderingContext2D.prototype.drawImage = function (img: Canvas, ...args: any)
{
    const _img = img as NodeCanvasElement;

    // call ctx to sync image data
    if (img instanceof Canvas && _img['_gl']) _img._updateCtx();

    return _drawImage.call(this, img, ...args);
};

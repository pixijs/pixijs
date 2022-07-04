/* eslint-disable dot-notation */
/* eslint-disable func-names */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import { Canvas, CanvasRenderingContext2D, Image, NodeCanvasRenderingContext2DSettings } from 'canvas';
import { EventEmitter } from '@pixi/utils';
import createGLContext from 'gl';
import { ContextIds } from '@pixi/settings';

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

export class NodeCanvasElement extends Canvas
{
    public _gl: WebGLRenderingContext;
    public style: Record<string, any>;
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

    toBuffer(...args: any)
    {
        const gl = this._gl;

        if (gl)
        {
            putImageData(gl, this);
        }

        // @ts-expect-error - overriding toBuffer
        return super.toBuffer(...args);
    }

    toDataURL(...args: any)
    {
        const gl = this._gl;

        if (gl)
        {
            putImageData(gl, this);
        }

        // @ts-expect-error - overriding toDataURL
        return super.toDataURL(...args);
    }

    addEventListener(type: string, listener: (...args: any[]) => void)
    {
        return this._event.addListener(type, listener);
    }

    removeEventListener(type: string, listener: (...args: any[]) => void)
    {
        if (listener)
        {
            return this._event.removeListener(type, listener);
        }

        return this._event.removeAllListeners(type);
    }

    dispatchEvent(event: {type: string, [key: string]: any})
    {
        event.target = this;

        return this._event.emit(event.type, event);
    }
}

const _drawImage = CanvasRenderingContext2D.prototype.drawImage;

// eslint-disable-next-line func-names
CanvasRenderingContext2D.prototype.drawImage = function (img: Canvas, ...args: any)
{
    const _img = img as NodeCanvasElement;

    // call ctx to sync image data
    if (img instanceof Canvas && _img._gl) _img._updateCtx();

    return _drawImage.call(this, img, ...args);
};

/* eslint-disable func-names */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Canvas, CanvasRenderingContext2D, Image, NodeCanvasRenderingContext2DSettings } from 'canvas';
import EventEmitter from 'events';
import createGLContext from 'gl';
import { ContextIds } from 'pixi.js';

const _ctx = Symbol('ctx');

function putImageData(gl: WebGLRenderingContext, canvas: NodeCanvasElement)
{
    const { width, height } = canvas;

    const ctx = canvas[_ctx] as CanvasRenderingContext2D;

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
export class NodeCanvasElement extends Canvas
{
    private __event__: EventEmitter;
    private __gl__: WebGLRenderingContext;
    private __contextType__: ContextIds;
    public style: Record<string, any>;

    constructor(width = 1, height = 1, type?: 'image' | 'pdf' | 'svg')
    {
        super(width, height, type);
        this.__event__ = new EventEmitter();
        this.style = {};
    }

    get width()
    {
        return super.width;
    }

    set width(value)
    {
        if (this.__gl__)
        {
            const ext = this.__gl__.getExtension('STACKGL_resize_drawingbuffer');

            ext.resize(value, this.height);
        }
        super.width = value;
    }

    get height()
    {
        return super.height;
    }

    set height(value)
    {
        if (this.__gl__)
        {
            const ext = this.__gl__.getExtension('STACKGL_resize_drawingbuffer');

            ext.resize(this.width, value);
        }
        super.height = value;
    }

    get clientWidth()
    {
        return super.width;
    }

    get clientHeight()
    {
        return super.height;
    }

    get __ctx__()
    {
        const gl = this.__gl__;

        if (gl)
        {
            putImageData(gl, this);
        }

        return this[_ctx];
    }

    override getContext(
        type: ContextIds,
        options?: NodeCanvasRenderingContext2DSettings | WebGLRenderingContext
    ): CanvasRenderingContext2D | WebGLRenderingContext
    {
        if (type === 'webgl2') return undefined;
        if (this.__contextType__ && this.__contextType__ !== type) return null;
        if (this.__gl__) return this.__gl__;
        this.__contextType__ = type;
        if (type === 'experimental-webgl' || type === 'webgl')
        {
            const { width, height } = this;

            this[_ctx] = super.getContext('2d', options as NodeCanvasRenderingContext2DSettings);
            const ctx = createGLContext(width, height, options as WebGLContextAttributes);
            const _getUniformLocation = ctx.getUniformLocation;

            // Temporary fix https://github.com/stackgl/headless-gl/issues/170
            ctx.getUniformLocation = function (program, name)
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

            ctx.canvas = this;
            const _tetImage2D = ctx.texImage2D;

            ctx.texImage2D = function (...args)
            {
                let pixels = args[args.length - 1];

                if (pixels && pixels._image) pixels = pixels._image;
                if (pixels instanceof Image)
                {
                    const canvas = new Canvas(pixels.width, pixels.height);

                    canvas.getContext('2d').drawImage(pixels, 0, 0);
                    args[args.length - 1] = canvas;
                }

                return _tetImage2D.apply(this, args);
            };
            this.__gl__ = ctx;

            return this.__gl__;
        }

        return super.getContext(type, options as NodeCanvasRenderingContext2DSettings);
    }

    toBuffer(...args: any)
    {
        const gl = this.__gl__;

        if (gl)
        {
            putImageData(gl, this);
        }

        return super.toBuffer(...args);
    }

    toDataURL(...args: any)
    {
        const gl = this.__gl__;

        if (gl)
        {
            putImageData(gl, this);
        }

        return super.toDataURL(...args);
    }

    addEventListener(type: string, listener: (...args: any[]) => void)
    {
        return this.__event__.addListener(type, listener);
    }

    removeEventListener(type: string, listener: (...args: any[]) => void)
    {
        if (listener)
        {
            return this.__event__.removeListener(type, listener);
        }

        return this.__event__.removeAllListeners(type);
    }

    dispatchEvent(event: {type: string, [key: string]: any})
    {
        event.target = this;

        return this.__event__.emit(event.type, event);
    }
}

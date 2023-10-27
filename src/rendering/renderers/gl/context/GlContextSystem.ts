import { ExtensionType } from '../../../../extensions/Extensions';
import { warn } from '../../../../utils/logging/warn';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { System } from '../../shared/system/System';
import type { GpuPowerPreference } from '../../types';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GlRenderingContext } from './GlRenderingContext';
import type { WebGLExtensions } from './WebGLExtensions';

export interface ISupportDict
{
    uint32Indices: boolean;
}

/**
 * Options for the context system.
 * @ignore
 */
export interface ContextSystemOptions
{
    /** **WebGL Only.** User-provided WebGL rendering context object. */
    context: WebGL2RenderingContext | null;
    /**
     * An optional hint indicating what configuration of GPU is suitable for the WebGL context,
     * can be `'high-performance'` or `'low-power'`.
     * Setting to `'high-performance'` will prioritize rendering performance over power consumption,
     * while setting to `'low-power'` will prioritize power saving over rendering performance.
     */
    powerPreference?: GpuPowerPreference;

    /** **WebGL Only.** Whether the compositor will assume the drawing buffer contains colors with premultiplied alpha. */
    premultipliedAlpha: boolean;
    /**
     * **WebGL Only.** Whether to enable drawing buffer preservation. If enabled, the drawing buffer will preserve
     * its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.
     */
    preserveDrawingBuffer: boolean;

    antialias?: boolean;
}

/** System plugin to the renderer to manage the context. */
export class GlContextSystem implements System<ContextSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'context',
    } as const;

    /** @ignore */
    public static defaultOptions: ContextSystemOptions = {
        /**
         * {@link WebGLOptions.context}
         * @default null
         */
        context: null,
        /**
         * {@link WebGLOptions.premultipliedAlpha}
         * @default true
         */
        premultipliedAlpha: true,
        /**
         * {@link WebGLOptions.preserveDrawingBuffer}
         * @default false
         */
        preserveDrawingBuffer: false,
        /**
         * {@link WebGLOptions.powerPreference}
         * @default default
         */
        powerPreference: undefined,
    };

    /**
     * Either 1 or 2 to reflect the WebGL version being used.
     * @readonly
     */
    public webGLVersion: number;

    /**
     * Features supported by current context.
     * @type {object}
     * @readonly
     * @property {boolean} uint32Indices - Support for 32-bit indices buffer.
     */
    public readonly supports: ISupportDict;

    protected CONTEXT_UID: number;
    protected gl: WebGL2RenderingContext;

    /**
     * Extensions available.
     * @type {object}
     * @readonly
     * @property {WEBGL_draw_buffers} drawBuffers - WebGL v1 extension
     * @property {WEBGL_depth_texture} depthTexture - WebGL v1 extension
     * @property {OES_texture_float} floatTexture - WebGL v1 extension
     * @property {WEBGL_lose_context} loseContext - WebGL v1 extension
     * @property {OES_vertex_array_object} vertexArrayObject - WebGL v1 extension
     * @property {EXT_texture_filter_anisotropic} anisotropicFiltering - WebGL v1 and v2 extension
     */
    public extensions: WebGLExtensions;

    private _renderer: WebGLRenderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;

        this.webGLVersion = 2;
        this.extensions = Object.create(null);

        this.supports = {
            uint32Indices: false,
        };

        // Bind functions
        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleContextRestored = this.handleContextRestored.bind(this);
    }

    /**
     * `true` if the context is lost
     * @readonly
     */
    get isLost(): boolean
    {
        return (!this.gl || this.gl.isContextLost());
    }

    /**
     * Handles the context change event.
     * @param {WebGLRenderingContext} gl - New WebGL context.
     */
    protected contextChange(gl: WebGL2RenderingContext): void
    {
        this.gl = gl;
        this._renderer.gl = gl;

        // restore a context if it was previously lost
        if (gl.isContextLost() && gl.getExtension('WEBGL_lose_context'))
        {
            gl.getExtension('WEBGL_lose_context').restoreContext();
        }
    }

    public init(options: ContextSystemOptions): void
    {
        /*
         * The options passed in to create a new WebGL context.
         */
        if (options?.context)
        {
            this.initFromContext(options.context);
        }
        else
        {
            const alpha = this._renderer.background.alpha < 1;
            const premultipliedAlpha = options.premultipliedAlpha ?? true;
            const antialias = options.antialias && !this._renderer.backBuffer.useBackBuffer;

            this.initFromOptions({
                alpha,
                premultipliedAlpha,
                antialias,
                stencil: true,
                preserveDrawingBuffer: options.preserveDrawingBuffer,
                powerPreference: options.powerPreference ?? 'default',
            });
        }
    }

    /**
     * Initializes the context.
     * @protected
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    protected initFromContext(gl: WebGL2RenderingContext): void
    {
        this.gl = gl;
        this.validateContext(gl);

        this._renderer.runners.contextChange.emit(gl);

        const element = this._renderer.view.canvas;

        (element as any).addEventListener('webglcontextlost', this.handleContextLost, false);
        element.addEventListener('webglcontextrestored', this.handleContextRestored, false);
    }

    /**
     * Initialize from context options
     * @protected
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
     * @param {object} options - context attributes
     */
    protected initFromOptions(options: WebGLContextAttributes): void
    {
        const gl = this.createContext(this._renderer.view.canvas, options);

        this.initFromContext(gl);
    }

    /**
     * Helper class to create a WebGL Context
     * @param canvas - the canvas element that we will get the context from
     * @param options - An options object that gets passed in to the canvas element containing the
     *    context attributes
     * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
     * @returns {WebGLRenderingContext} the WebGL context
     */
    public createContext(canvas: ICanvas, options: WebGLContextAttributes): GlRenderingContext
    {
        const gl = canvas.getContext('webgl2', options);

        this.webGLVersion = 2;
        this.gl = gl as WebGL2RenderingContext;

        this.getExtensions();

        return this.gl;
    }

    /** Auto-populate the {@link ContextSystem.extensions extensions}. */
    protected getExtensions(): void
    {
        // time to set up default extensions that Pixi uses.
        const { gl } = this;

        const common = {
            anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
            floatTextureLinear: gl.getExtension('OES_texture_float_linear'),

            s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
            s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), // eslint-disable-line camelcase
            etc: gl.getExtension('WEBGL_compressed_texture_etc'),
            etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
            pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
                || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
            atc: gl.getExtension('WEBGL_compressed_texture_atc'),
            astc: gl.getExtension('WEBGL_compressed_texture_astc'),
            bptc: gl.getExtension('EXT_texture_compression_bptc')
        };

        Object.assign(this.extensions, common, {
            // Floats and half-floats
            colorBufferFloat: gl.getExtension('EXT_color_buffer_float'),
        });
    }

    /**
     * Handles a lost webgl context
     * @param {WebGLContextEvent} event - The context lost event.
     */
    protected handleContextLost(event: WebGLContextEvent): void
    {
        event.preventDefault();
    }

    /** Handles a restored webgl context. */
    protected handleContextRestored(): void
    {
        this._renderer.runners.contextChange.emit(this.gl);
    }

    public destroy(): void
    {
        const element = this._renderer.view.canvas;

        this._renderer = null;

        // remove listeners
        (element as any).removeEventListener('webglcontextlost', this.handleContextLost);
        element.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.gl.useProgram(null);

        if (this.extensions.loseContext)
        {
            this.extensions.loseContext.loseContext();
        }
    }

    /**
     * Validate context.
     * @param {WebGLRenderingContext} gl - Render context.
     */
    protected validateContext(gl: WebGL2RenderingContext): void
    {
        const attributes = gl.getContextAttributes();

        const isWebGl2 = 'WebGL2RenderingContext' in globalThis && gl instanceof globalThis.WebGL2RenderingContext;

        if (isWebGl2)
        {
            this.webGLVersion = 2;
        }

        // this is going to be fairly simple for now.. but at least we have room to grow!
        if (attributes && !attributes.stencil)
        {
            // #if _DEBUG
            /* eslint-disable max-len, no-console */
            warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable max-len, no-console */
            // #endif
        }

        const hasUint32 = isWebGl2 || !!(gl as WebGLRenderingContext).getExtension('OES_element_index_uint');

        this.supports.uint32Indices = hasUint32;

        if (!hasUint32)
        {
            // #if _DEBUG
            /* eslint-disable max-len, no-console */
            warn('Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly');
            /* eslint-enable max-len, no-console */
            // #endif
        }
    }
}

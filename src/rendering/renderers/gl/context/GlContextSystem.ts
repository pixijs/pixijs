import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { warn } from '../../../../utils/logging/warn';
import { type GpuPowerPreference } from '../../types';

import type { System } from '../../shared/system/System';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { WebGLExtensions } from './WebGLExtensions';

/**
 * Options for the context system.
 * @memberof rendering
 * @property {WebGL2RenderingContext | null} [context=null] - User-provided WebGL rendering context object.
 * @property {GpuPowerPreference} [powerPreference='default'] - An optional hint indicating what configuration
 * of GPU is suitable for the WebGL context, can be `'high-performance'` or `'low-power'`. Setting to `'high-performance'`
 * will prioritize rendering performance over power consumption, while setting to `'low-power'` will prioritize power saving
 * over rendering performance.
 * @property {boolean} [premultipliedAlpha=true] - Whether the compositor will assume the drawing buffer contains
 * colors with premultiplied alpha.
 * @property {boolean} [preserveDrawingBuffer=false] - Whether to enable drawing buffer preservation.
 * If enabled, the drawing buffer will preserve
 * its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.
 * @property {boolean} [antialias] - Whether to enable antialiasing.
 * @property {1 | 2} [preferWebGLVersion=2] - The preferred WebGL version to use.
 */
export interface ContextSystemOptions
{
    /**
     * User-provided WebGL rendering context object.
     * @default null
     * @memberof rendering.SharedRendererOptions
     */
    context: WebGL2RenderingContext | null;
    /**
     * An optional hint indicating what configuration of GPU is suitable for the WebGL context,
     * can be `'high-performance'` or `'low-power'`.
     * Setting to `'high-performance'` will prioritize rendering performance over power consumption,
     * while setting to `'low-power'` will prioritize power saving over rendering performance.
     * @memberof rendering.SharedRendererOptions
     * @default undefined
     */
    powerPreference?: GpuPowerPreference;

    /**
     * Whether the compositor will assume the drawing buffer contains colors with premultiplied alpha.
     * @default true
     * @memberof rendering.SharedRendererOptions
     */
    premultipliedAlpha: boolean;
    /**
     * Whether to enable drawing buffer preservation. If enabled, the drawing buffer will preserve
     * its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.
     * @default false
     * @memberof rendering.SharedRendererOptions
     */
    preserveDrawingBuffer: boolean;

    antialias?: boolean;

    /**
     * The preferred WebGL version to use.
     * @default 2
     * @memberof rendering.SharedRendererOptions
     */
    preferWebGLVersion?: 1 | 2;
}

/**
 * System plugin to the renderer to manage the context
 * @memberof rendering
 */
export class GlContextSystem implements System<ContextSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'context',
    } as const;

    /** The default options for the system. */
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
        /**
         * {@link WebGLOptions.webGLVersion}
         * @default 2
         */
        preferWebGLVersion: 2,
    };

    protected CONTEXT_UID: number;
    protected gl: WebGL2RenderingContext;

    /**
     * Features supported by current renderer.
     * @type {object}
     * @readonly
     */
    public supports = {
        /** Support for 32-bit indices buffer. */
        uint32Indices: true,
        /** Support for UniformBufferObjects */
        uniformBufferObject: true,
        /** Support for VertexArrayObjects */
        vertexArrayObject: true,
        /** Support for SRGB texture format */
        srgbTextures: true,
        /** Support for wrapping modes if a texture is non-power of two */
        nonPowOf2wrapping: true,
        /** Support for MSAA (antialiasing of dynamic textures) */
        msaa: true,
        /** Support for mipmaps if a texture is non-power of two */
        nonPowOf2mipmaps: true,
    };

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

    public webGLVersion: 1 | 2;

    private _renderer: WebGLRenderer;
    private _contextLossForced: boolean;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;

        this.extensions = Object.create(null);

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
    }

    public init(options: ContextSystemOptions): void
    {
        options = { ...GlContextSystem.defaultOptions, ...options };

        /*
         * The options passed in to create a new WebGL context.
         */
        if (options.context)
        {
            this.initFromContext(options.context);
        }
        else
        {
            const alpha = this._renderer.background.alpha < 1;
            const premultipliedAlpha = options.premultipliedAlpha ?? true;
            const antialias = options.antialias && !this._renderer.backBuffer.useBackBuffer;

            this.createContext(options.preferWebGLVersion, {
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

        this.webGLVersion = gl instanceof DOMAdapter.get().getWebGLRenderingContext() ? 1 : 2;

        this.getExtensions();

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
     * @param preferWebGLVersion
     * @param {object} options - context attributes
     */
    protected createContext(preferWebGLVersion: 1 | 2, options: WebGLContextAttributes): void
    {
        let gl: WebGL2RenderingContext | WebGLRenderingContext;
        const canvas = this._renderer.view.canvas;

        if (preferWebGLVersion === 2)
        {
            gl = canvas.getContext('webgl2', options);
        }

        if (!gl)
        {
            gl = canvas.getContext('webgl', options);

            if (!gl)
            {
                // fail, not able to get a context
                throw new Error('This browser does not support WebGL. Try using the canvas renderer');
            }
        }

        this.gl = gl as WebGL2RenderingContext;

        this.initFromContext(this.gl);
    }

    /** Auto-populate the {@link GlContextSystem.extensions extensions}. */
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
            bptc: gl.getExtension('EXT_texture_compression_bptc'),
            rgtc: gl.getExtension('EXT_texture_compression_rgtc'),
            loseContext: gl.getExtension('WEBGL_lose_context'),
        };

        if (this.webGLVersion === 1)
        {
            this.extensions = {
                ...common,

                drawBuffers: gl.getExtension('WEBGL_draw_buffers'),
                depthTexture: gl.getExtension('WEBGL_depth_texture'),
                vertexArrayObject: gl.getExtension('OES_vertex_array_object')
                    || gl.getExtension('MOZ_OES_vertex_array_object')
                    || gl.getExtension('WEBKIT_OES_vertex_array_object'),
                uint32ElementIndex: gl.getExtension('OES_element_index_uint'),
                // Floats and half-floats
                floatTexture: gl.getExtension('OES_texture_float'),
                floatTextureLinear: gl.getExtension('OES_texture_float_linear'),
                textureHalfFloat: gl.getExtension('OES_texture_half_float'),
                textureHalfFloatLinear: gl.getExtension('OES_texture_half_float_linear'),
                vertexAttribDivisorANGLE: gl.getExtension('ANGLE_instanced_arrays'),
                srgb: gl.getExtension('EXT_sRGB'),
            };
        }
        else
        {
            this.extensions = {
                ...common,
                colorBufferFloat: gl.getExtension('EXT_color_buffer_float'),
            };

            const provokeExt = gl.getExtension('WEBGL_provoking_vertex');

            if (provokeExt)
            {
                provokeExt.provokingVertexWEBGL(provokeExt.FIRST_VERTEX_CONVENTION_WEBGL);
            }
        }
    }

    /**
     * Handles a lost webgl context
     * @param {WebGLContextEvent} event - The context lost event.
     */
    protected handleContextLost(event: WebGLContextEvent): void
    {
        event.preventDefault();

        // only restore if we purposefully nuked it
        if (this._contextLossForced)
        {
            this._contextLossForced = false;
            // Restore the context after this event has exited
            setTimeout(() =>
            {
                if (this.gl.isContextLost())
                {
                    this.extensions.loseContext?.restoreContext();
                }
            }, 0);
        }
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

        this.extensions.loseContext?.loseContext();
    }

    /**
     * this function can be called to force a webGL context loss
     * this will release all resources on the GPU.
     * Useful if you need to put Pixi to sleep, and save some GPU memory
     *
     * As soon as render is called - all resources will be created again.
     */
    public forceContextLoss(): void
    {
        this.extensions.loseContext?.loseContext();
        this._contextLossForced = true;
    }
    /**
     * Validate context.
     * @param {WebGLRenderingContext} gl - Render context.
     */
    protected validateContext(gl: WebGL2RenderingContext): void
    {
        const attributes = gl.getContextAttributes();

        // this is going to be fairly simple for now.. but at least we have room to grow!
        if (attributes && !attributes.stencil)
        {
            // #if _DEBUG
            /* eslint-disable max-len, no-console */
            warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable max-len, no-console */
            // #endif
        }

        // support
        const supports = this.supports;

        const isWebGl2 = this.webGLVersion === 2;
        const extensions = this.extensions;

        supports.uint32Indices = isWebGl2 || !!extensions.uint32ElementIndex;
        supports.uniformBufferObject = isWebGl2;
        supports.vertexArrayObject = isWebGl2 || !!extensions.vertexArrayObject;
        supports.srgbTextures = isWebGl2 || !!extensions.srgb;
        supports.nonPowOf2wrapping = isWebGl2;
        supports.nonPowOf2mipmaps = isWebGl2;
        supports.msaa = isWebGl2;

        if (!supports.uint32Indices)
        {
            // #if _DEBUG
            /* eslint-disable max-len, no-console */
            warn('Provided WebGL context does not support 32 index buffer, large scenes may not render correctly');
            /* eslint-enable max-len, no-console */
            // #endif
        }
    }
}

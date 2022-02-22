import { ENV } from '@pixi/constants';
import { settings } from '../settings';

import type { ISystem } from '../ISystem';
import type { IRenderingContext } from '../IRenderingContext';
import type { Renderer } from '../Renderer';
import type { WebGLExtensions } from './WebGLExtensions';

let CONTEXT_UID_COUNTER = 0;

export interface ISupportDict {
    uint32Indices: boolean;
}

/**
 * System plugin to the renderer to manage the context.
 *
 * @memberof PIXI
 */
export class ContextSystem implements ISystem
{
    /**
     * Either 1 or 2 to reflect the WebGL version being used.
     *
     * @readonly
     */
    public webGLVersion: number;

    /**
     * Features supported by current context.
     *
     * @type {object}
     * @readonly
     * @property {boolean} uint32Indices - Support for 32-bit indices buffer.
     */
    readonly supports: ISupportDict;

    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;

    /**
     * Extensions available.
     *
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

    private renderer: Renderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.webGLVersion = 1;
        this.extensions = {};

        this.supports = {
            uint32Indices: false,
        };

        // Bind functions
        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleContextRestored = this.handleContextRestored.bind(this);

        (renderer.view as any).addEventListener('webglcontextlost', this.handleContextLost, false);
        renderer.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);
    }

    /**
     * `true` if the context is lost
     *
     * @readonly
     */
    get isLost(): boolean
    {
        return (!this.gl || this.gl.isContextLost());
    }

    /**
     * Handles the context change event.
     *
     * @param {WebGLRenderingContext} gl - New WebGL context.
     */
    protected contextChange(gl: IRenderingContext): void
    {
        this.gl = gl;
        this.renderer.gl = gl;
        this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;

        // restore a context if it was previously lost
        if (gl.isContextLost() && gl.getExtension('WEBGL_lose_context'))
        {
            gl.getExtension('WEBGL_lose_context').restoreContext();
        }
    }

    /**
     * Initializes the context.
     *
     * @protected
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    initFromContext(gl: IRenderingContext): void
    {
        this.gl = gl;
        this.validateContext(gl);
        this.renderer.gl = gl;
        this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
        this.renderer.runners.contextChange.emit(gl);
    }

    /**
     * Initialize from context options
     *
     * @protected
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
     * @param {object} options - context attributes
     */
    initFromOptions(options: WebGLContextAttributes): void
    {
        const gl = this.createContext(this.renderer.view, options);

        this.initFromContext(gl);
    }

    /**
     * Helper class to create a WebGL Context
     *
     * @param canvas - the canvas element that we will get the context from
     * @param options - An options object that gets passed in to the canvas element containing the
     *    context attributes
     * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
     * @return {WebGLRenderingContext} the WebGL context
     */
    createContext(canvas: HTMLCanvasElement, options: WebGLContextAttributes): IRenderingContext
    {
        let gl;

        if (settings.PREFER_ENV >= ENV.WEBGL2)
        {
            gl = canvas.getContext('webgl2', options);
        }

        if (gl)
        {
            this.webGLVersion = 2;
        }
        else
        {
            this.webGLVersion = 1;

            gl = canvas.getContext('webgl', options)
            || canvas.getContext('experimental-webgl', options);

            if (!gl)
            {
                // fail, not able to get a context
                throw new Error('This browser does not support WebGL. Try using the canvas renderer');
            }
        }

        this.gl = gl as IRenderingContext;

        this.getExtensions();

        return this.gl;
    }

    /** Auto-populate the {@link PIXI.ContextSystem.extensions extensions}. */
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
            astc: gl.getExtension('WEBGL_compressed_texture_astc')
        };

        if (this.webGLVersion === 1)
        {
            Object.assign(this.extensions, common, {
                drawBuffers: gl.getExtension('WEBGL_draw_buffers'),
                depthTexture: gl.getExtension('WEBGL_depth_texture'),
                loseContext: gl.getExtension('WEBGL_lose_context'),
                vertexArrayObject: gl.getExtension('OES_vertex_array_object')
                    || gl.getExtension('MOZ_OES_vertex_array_object')
                    || gl.getExtension('WEBKIT_OES_vertex_array_object'),
                uint32ElementIndex: gl.getExtension('OES_element_index_uint'),
                // Floats and half-floats
                floatTexture: gl.getExtension('OES_texture_float'),
                floatTextureLinear: gl.getExtension('OES_texture_float_linear'),
                textureHalfFloat: gl.getExtension('OES_texture_half_float'),
                textureHalfFloatLinear: gl.getExtension('OES_texture_half_float_linear'),
            });
        }
        else if (this.webGLVersion === 2)
        {
            Object.assign(this.extensions, common, {
                // Floats and half-floats
                colorBufferFloat: gl.getExtension('EXT_color_buffer_float')
            });
        }
    }

    /**
     * Handles a lost webgl context
     *
     * @param {WebGLContextEvent} event - The context lost event.
     */
    protected handleContextLost(event: WebGLContextEvent): void
    {
        event.preventDefault();
    }

    /** Handles a restored webgl context. */
    protected handleContextRestored(): void
    {
        this.renderer.runners.contextChange.emit(this.gl);
    }

    destroy(): void
    {
        const view = this.renderer.view;

        this.renderer = null;

        // remove listeners
        (view as any).removeEventListener('webglcontextlost', this.handleContextLost);
        view.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.gl.useProgram(null);

        if (this.extensions.loseContext)
        {
            this.extensions.loseContext.loseContext();
        }
    }

    /** Handle the post-render runner event. */
    protected postrender(): void
    {
        if (this.renderer.renderingToScreen)
        {
            this.gl.flush();
        }
    }

    /**
     * Validate context.
     *
     * @param {WebGLRenderingContext} gl - Render context.
     */
    protected validateContext(gl: IRenderingContext): void
    {
        const attributes = gl.getContextAttributes();

        const isWebGl2 = 'WebGL2RenderingContext' in globalThis && gl instanceof globalThis.WebGL2RenderingContext;

        if (isWebGl2)
        {
            this.webGLVersion = 2;
        }

        // this is going to be fairly simple for now.. but at least we have room to grow!
        if (!attributes.stencil)
        {
            /* eslint-disable max-len, no-console */
            console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable max-len, no-console */
        }

        const hasuint32 = isWebGl2 || !!(gl as WebGLRenderingContext).getExtension('OES_element_index_uint');

        this.supports.uint32Indices = hasuint32;

        if (!hasuint32)
        {
            /* eslint-disable max-len, no-console */
            console.warn('Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly');
            /* eslint-enable max-len, no-console */
        }
    }
}

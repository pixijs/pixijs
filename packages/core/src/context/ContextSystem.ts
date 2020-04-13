import { ENV } from '@pixi/constants';
import { System } from '../System';
import { settings } from '../settings';

import type { IRenderingContext } from '../IRenderingContext';
import type { Renderer } from '../Renderer';

let CONTEXT_UID_COUNTER = 0;

export interface ISupportDict {
    uint32Indices: boolean;
}
/**
 * System plugin to the renderer to manage the context.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class ContextSystem extends System
{
    public webGLVersion: number;
    readonly supports: ISupportDict;

    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;
    /* eslint-disable @typescript-eslint/camelcase */
    extensions:
    {
        drawBuffers?: WEBGL_draw_buffers;
        depthTexture?: OES_texture_float;
        loseContext?: WEBGL_lose_context;
        vertexArrayObject?: OES_vertex_array_object;
        anisotropicFiltering?: EXT_texture_filter_anisotropic;
        uint32ElementIndex?: OES_element_index_uint;
        floatTexture?: OES_texture_float;
        floatTextureLinear?: OES_texture_float_linear;
        textureHalfFloat?: OES_texture_half_float;
        textureHalfFloatLinear?: OES_texture_half_float_linear;
        colorBufferFloat?: WEBGL_color_buffer_float;
    };
    /* eslint-enable @typescript-eslint/camelcase */

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        /**
         * Either 1 or 2 to reflect the WebGL version being used
         * @member {number}
         * @readonly
         */
        this.webGLVersion = 1;

        /**
         * Extensions being used
         * @member {object}
         * @readonly
         * @property {WEBGL_draw_buffers} drawBuffers - WebGL v1 extension
         * @property {WEBGL_depth_texture} depthTexture - WebGL v1 extension
         * @property {OES_texture_float} floatTexture - WebGL v1 extension
         * @property {WEBGL_lose_context} loseContext - WebGL v1 extension
         * @property {OES_vertex_array_object} vertexArrayObject - WebGL v1 extension
         * @property {EXT_texture_filter_anisotropic} anisotropicFiltering - WebGL v1 and v2 extension
         */
        this.extensions = {};

        /**
         * Features supported by current context
         * @member {object}
         * @private
         * @readonly
         * @property {boolean} uint32Indices - Supports of 32-bit indices buffer
         */
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
     * @member {boolean}
     * @readonly
     */
    get isLost(): boolean
    {
        return (!this.gl || this.gl.isContextLost());
    }

    /**
     * Handle the context change event
     * @param {WebGLRenderingContext} gl new webgl context
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
     * Initialize the context
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
     * @param canvas {HTMLCanvasElement} the canvas element that we will get the context from
     * @param options {object} An options object that gets passed in to the canvas element containing the context attributes
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

    /**
     * Auto-populate the extensions
     *
     * @protected
     */
    protected getExtensions(): void
    {
        // time to set up default extensions that Pixi uses.
        const { gl } = this;

        if (this.webGLVersion === 1)
        {
            Object.assign(this.extensions, {
                drawBuffers: gl.getExtension('WEBGL_draw_buffers'),
                depthTexture: gl.getExtension('WEBGL_depth_texture'),
                loseContext: gl.getExtension('WEBGL_lose_context'),
                vertexArrayObject: gl.getExtension('OES_vertex_array_object')
                    || gl.getExtension('MOZ_OES_vertex_array_object')
                    || gl.getExtension('WEBKIT_OES_vertex_array_object'),
                anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
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
            Object.assign(this.extensions, {
                anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
                // Floats and half-floats
                colorBufferFloat: gl.getExtension('EXT_color_buffer_float'),
                floatTextureLinear: gl.getExtension('OES_texture_float_linear'),
            });
        }
    }

    /**
     * Handles a lost webgl context
     *
     * @protected
     * @param {WebGLContextEvent} event - The context lost event.
     */
    protected handleContextLost(event: WebGLContextEvent): void
    {
        event.preventDefault();
    }

    /**
     * Handles a restored webgl context
     *
     * @protected
     */
    protected handleContextRestored(): void
    {
        this.renderer.runners.contextChange.emit(this.gl);
    }

    destroy(): void
    {
        const view = this.renderer.view;

        // remove listeners
        (view as any).removeEventListener('webglcontextlost', this.handleContextLost);
        view.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.gl.useProgram(null);

        if (this.extensions.loseContext)
        {
            this.extensions.loseContext.loseContext();
        }
    }

    /**
     * Handle the post-render runner event
     *
     * @protected
     */
    protected postrender(): void
    {
        if (this.renderer.renderingToScreen)
        {
            this.gl.flush();
        }
    }

    /**
     * Validate context
     *
     * @protected
     * @param {WebGLRenderingContext} gl - Render context
     */
    protected validateContext(gl: IRenderingContext): void
    {
        const attributes = gl.getContextAttributes();

        // this is going to be fairly simple for now.. but at least we have room to grow!
        if (!attributes.stencil)
        {
            /* eslint-disable max-len, no-console */
            console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable max-len, no-console */
        }

        const hasuint32
            = ('WebGL2RenderingContext' in window && gl instanceof window.WebGL2RenderingContext)
            || !!(gl as WebGLRenderingContext).getExtension('OES_element_index_uint');

        this.supports.uint32Indices = hasuint32;

        if (!hasuint32)
        {
            /* eslint-disable max-len, no-console */
            console.warn('Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly');
            /* eslint-enable max-len, no-console */
        }
    }
}

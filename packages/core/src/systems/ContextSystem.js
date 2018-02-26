import WebGLSystem from './WebGLSystem';
import { settings } from '@pixi/settings';

let CONTEXT_UID = 0;

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */
export default class ContextSystem extends WebGLSystem
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.webGLVersion = 1;

        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleContextRestored = this.handleContextRestored.bind(this);

        this.extensions = {};

        renderer.view.addEventListener('webglcontextlost', this.handleContextLost, false);
        renderer.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);
    }

    get isLost()
    {
        return (!this.gl || this.gl.isContextLost());
    }

    contextChange(gl)
    {
        this.gl = gl;

        // restore a context if it was previously lost
        if (gl.isContextLost() && gl.getExtension('WEBGL_lose_context'))
        {
            gl.getExtension('WEBGL_lose_context').restoreContext();
        }
    }

    initFromContext(gl)
    {
        this.gl = gl;
        this.validateContext(gl);
        this.renderer.gl = gl;
        this.renderer.CONTEXT_UID = CONTEXT_UID++;
        this.renderer.runners.contextChange.run(gl);
    }

    initFromOptions(options)
    {
        const gl = this.createContext(this.renderer.view, options);

        this.initFromContext(gl);
    }

    /**
     * Helper class to create a webGL Context
     *
     * @class
     * @memberof PIXI.glCore
     * @param canvas {HTMLCanvasElement} the canvas element that we will get the context from
     * @param options {Object} An options object that gets passed in to the canvas element containing the context attributes,
     * see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext for the options available
     * @return {WebGLRenderingContext} the WebGL context
     */
    createContext(canvas, options)
    {
        let gl;

        if (settings.PREFER_WEBGL_2)
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
                throw new Error('This browser does not support webGL. Try using the canvas renderer');
            }
        }

        this.gl = gl;

        this.getExtensions();

        return gl;
    }

    getExtensions()
    {
        // time to set up default etensions that pixi uses..
        const gl = this.gl;
        const extensions = this.extensions;

        if (this.webGLVersion === 1)
        {
            extensions.drawBuffers = gl.getExtension('WEBGL_draw_buffers');
            extensions.depthTexture = gl.getExtension('WEBKIT_WEBGL_depth_texture');
            extensions.floatTexture = gl.getExtension('OES_texture_float');
            extensions.loseContext = gl.getExtension('WEBGL_lose_context');

            extensions.vertexArrayObject = gl.getExtension('OES_vertex_array_object')
                                        || gl.getExtension('MOZ_OES_vertex_array_object')
                                        || gl.getExtension('WEBKIT_OES_vertex_array_object');
        }

        // we don't use any specific WebGL 2 ones yet!
    }

    /**
     * Handles a lost webgl context
     *
     * @private
     * @param {WebGLContextEvent} event - The context lost event.
     */
    handleContextLost(event)
    {
        event.preventDefault();
    }

    /**
     * Handles a restored webgl context
     *
     * @private
     */
    handleContextRestored()
    {
        this.renderer.runners.contextChange.run(this.gl);
    }

    destroy()
    {
        const view = this.renderer.view;

        // remove listeners
        view.removeEventListener('webglcontextlost', this.handleContextLost);
        view.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.gl.useProgram(null);

        if (this.extensions.loseContext)
        {
            this.extensions.loseContext.loseContext();
        }
    }

    postrender()
    {
        this.gl.flush();
    }

    validateContext(gl)
    {
        const attributes = gl.getContextAttributes();

        // this is going to be fairly simple for now.. but at least we have room to grow!
        if (!attributes.stencil)
        {
            /* eslint-disable max-len */

            /* eslint-disable no-console */
            console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable no-console */

            /* eslint-enable max-len */
        }
    }
}

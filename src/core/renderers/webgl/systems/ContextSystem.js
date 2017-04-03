import WebGLSystem from './WebGLSystem';
import { Rectangle, Matrix } from '../../../math';
import glCore from 'pixi-gl-core';

let CONTEXT_UID = 0;

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

export default class ContextSystem extends WebGLSystem
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleContextRestored = this.handleContextRestored.bind(this);

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

        // set the latest testing context..
        if(!glCore._testingContext)
        {
        	glCore._testingContext = gl;
        }

        // setup the width/height properties and gl viewport
        //this.resize(this.screen.width, this.screen.height);
       // const renderer = this.renderer;

     //   renderer.resize(renderer.screen.width, renderer.screen.height);
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
    	const gl = glCore.createContext(this.renderer.view, options);
    	this.initFromContext(gl);
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
        this.renderer.runners.contextChange.run(gl);

        // TODO - tidy up textures?
        //this.textureSystem.removeAll();
    }

    destroy()
    {
    	const view = this.renderer.view;

    	// remove listeners
        view.removeEventListener('webglcontextlost', this.handleContextLost);
        view.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.gl.useProgram(null);

        if (this.gl.getExtension('WEBGL_lose_context'))
        {
            this.gl.getExtension('WEBGL_lose_context').loseContext();
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
            /* eslint-disable no-console */
            console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly');
            /* eslint-enable no-console */
        }
    }
}

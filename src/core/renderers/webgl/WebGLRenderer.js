import SystemRenderer from '../SystemRenderer';
import MaskManager from './managers/MaskManager';
import StencilManager from './managers/StencilManager';
import FilterManager from './managers/FilterManager';
import RenderTarget from './utils/RenderTarget';
import ObjectRenderer from './utils/ObjectRenderer';
import TextureManager from './TextureManager';
import TextureGarbageCollector from './TextureGarbageCollector';
import WebGLState from './WebGLState';
import mapWebGLDrawModesToPixi from './utils/mapWebGLDrawModesToPixi';
import validateContext from './utils/validateContext';
import { pluginTarget } from '../../utils';
import glCore from 'pixi-gl-core';
import { RENDERER_TYPE } from '../../const';

let CONTEXT_UID = 0;

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 */
export default class WebGLRenderer extends SystemRenderer
{
    /**
     *
     * @param {number} [width=0] - the width of the canvas view
     * @param {number} [height=0] - the height of the canvas view
     * @param {object} [options] - The optional renderer parameters
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoResize=false] - If the render view is automatically resized, default false
     * @param {boolean} [options.antialias=false] - sets antialias. If not available natively then FXAA
     *  antialiasing is used
     * @param {boolean} [options.forceFXAA=false] - forces FXAA antialiasing to be used over native.
     *  FXAA is faster, but may not always look as great
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer.
     *  The resolution of the renderer retina would be 2.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the CanvasRenderer will clear
     *  the canvas or not before the new render pass. If you wish to set this to false, you *must* set
     *  preserveDrawingBuffer to `true`.
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the webgl context.
     * @param {boolean} [options.roundPixels=false] - If true Pixi will Math.floor() x/y values when
     *  rendering, stopping pixel interpolation.
     */
    constructor(width, height, options = {})
    {
        super('WebGL', width, height, options);
        /**
         * The type of this renderer as a standardised const
         *
         * @member {number}
         * @see PIXI.RENDERER_TYPE
         */
        this.type = RENDERER_TYPE.WEBGL;

        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleContextRestored = this.handleContextRestored.bind(this);

        this.view.addEventListener('webglcontextlost', this.handleContextLost, false);
        this.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);

        /**
         * The options passed in to create a new webgl context.
         *
         * @member {object}
         * @private
         */
        this._contextOptions = {
            alpha: this.transparent,
            antialias: options.antialias,
            premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
            stencil: true,
            preserveDrawingBuffer: options.preserveDrawingBuffer,
        };

        this._backgroundColorRgba[3] = this.transparent ? 0 : 1;

        /**
         * Manages the masks using the stencil buffer.
         *
         * @member {PIXI.MaskManager}
         */
        this.maskManager = new MaskManager(this);

        /**
         * Manages the stencil buffer.
         *
         * @member {PIXI.StencilManager}
         */
        this.stencilManager = new StencilManager(this);

        /**
         * An empty renderer.
         *
         * @member {PIXI.ObjectRenderer}
         */
        this.emptyRenderer = new ObjectRenderer(this);

        /**
         * The currently active ObjectRenderer.
         *
         * @member {PIXI.ObjectRenderer}
         */
        this.currentRenderer = this.emptyRenderer;

        this.initPlugins();

        /**
         * The current WebGL rendering context, it is created here
         *
         * @member {WebGLRenderingContext}
         */
        // initialize the context so it is ready for the managers.
        if (options.context)
        {
            // checks to see if a context is valid..
            validateContext(options.context);
        }

        this.gl = options.context || glCore.createContext(this.view, this._contextOptions);

        this.CONTEXT_UID = CONTEXT_UID++;

        /**
         * The currently active ObjectRenderer.
         *
         * @member {PIXI.WebGLState}
         */
        this.state = new WebGLState(this.gl);

        this.renderingToScreen = true;

        this._initContext();

        /**
         * Manages the filters.
         *
         * @member {PIXI.FilterManager}
         */
        this.filterManager = new FilterManager(this);
        // map some webGL blend and drawmodes..
        this.drawModes = mapWebGLDrawModesToPixi(this.gl);

        /**
         * Holds the current shader
         *
         * @member {PIXI.Shader}
         */
        this._activeShader = null;

        /**
         * Holds the current render target
         *
         * @member {PIXI.RenderTarget}
         */
        this._activeRenderTarget = null;
        this._activeTextureLocation = 999;
        this._activeTexture = null;

        this.setBlendMode(0);
    }

    /**
     * Creates the WebGL context
     *
     * @private
     */
    _initContext()
    {
        const gl = this.gl;

        // create a texture manager...
        this.textureManager = new TextureManager(this);
        this.textureGC = new TextureGarbageCollector(this);

        this.state.resetToDefault();

        this.rootRenderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);
        this.rootRenderTarget.clearColor = this._backgroundColorRgba;

        this.bindRenderTarget(this.rootRenderTarget);

        this.emit('context', gl);

        // setup the width/height properties and gl viewport
        this.resize(this.width, this.height);
    }

    /**
     * Renders the object to its webGL view
     *
     * @param {PIXI.DisplayObject} displayObject - the object to be rendered
     * @param {PIXI.RenderTexture} renderTexture - The render texture to render to.
     * @param {boolean} [clear] - Should the canvas be cleared before the new render
     * @param {PIXI.Transform} [transform] - A transform to apply to the render texture before rendering.
     * @param {boolean} [skipUpdateTransform] - Should we skip the update transform pass?
     */
    render(displayObject, renderTexture, clear, transform, skipUpdateTransform)
    {
        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        this.emit('prerender');

        // no point rendering if our context has been blown up!
        if (!this.gl || this.gl.isContextLost())
        {
            return;
        }

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.parent;

            displayObject.parent = this._tempDisplayObjectParent;
            displayObject.updateTransform();
            displayObject.parent = cacheParent;
           // displayObject.hitArea = //TODO add a temp hit area
        }

        this.bindRenderTexture(renderTexture, transform);

        this.currentRenderer.start();

        if (clear !== undefined ? clear : this.clearBeforeRender)
        {
            this._activeRenderTarget.clear();
        }

        displayObject.renderWebGL(this);

        // apply transform..
        this.currentRenderer.flush();

        // this.setObjectRenderer(this.emptyRenderer);

        this.textureGC.update();

        this.emit('postrender');
    }

    /**
     * Changes the current renderer to the one given in parameter
     *
     * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
     */
    setObjectRenderer(objectRenderer)
    {
        if (this.currentRenderer === objectRenderer)
        {
            return;
        }

        this.currentRenderer.stop();
        this.currentRenderer = objectRenderer;
        this.currentRenderer.start();
    }

    /**
     * This shoudl be called if you wish to do some custom rendering
     * It will basically render anything that may be batched up such as sprites
     *
     */
    flush()
    {
        this.setObjectRenderer(this.emptyRenderer);
    }

    /**
     * Resizes the webGL view to the specified width and height.
     *
     * @param {number} width - the new width of the webGL view
     * @param {number} height - the new height of the webGL view
     */
    resize(width, height)
    {
      //  if(width * this.resolution === this.width && height * this.resolution === this.height)return;

        SystemRenderer.prototype.resize.call(this, width, height);

        this.rootRenderTarget.resize(width, height);

        if (this._activeRenderTarget === this.rootRenderTarget)
        {
            this.rootRenderTarget.activate();

            if (this._activeShader)
            {
                this._activeShader.uniforms.projectionMatrix = this.rootRenderTarget.projectionMatrix.toArray(true);
            }
        }
    }

    /**
     * Resizes the webGL view to the specified width and height.
     *
     * @param {number} blendMode - the desired blend mode
     */
    setBlendMode(blendMode)
    {
        this.state.setBlendMode(blendMode);
    }

    /**
     * Erases the active render target and fills the drawing area with a colour
     *
     * @param {number} [clearColor] - The colour
     */
    clear(clearColor)
    {
        this._activeRenderTarget.clear(clearColor);
    }

    /**
     * Sets the transform of the active render target to the given matrix
     *
     * @param {PIXI.Matrix} matrix - The transformation matrix
     */
    setTransform(matrix)
    {
        this._activeRenderTarget.transform = matrix;
    }

    /**
     * Binds a render texture for rendering
     *
     * @param {PIXI.RenderTexture} renderTexture - The render texture to render
     * @param {PIXI.Transform} transform - The transform to be applied to the render texture
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindRenderTexture(renderTexture, transform)
    {
        let renderTarget;

        if (renderTexture)
        {
            const baseTexture = renderTexture.baseTexture;
            const gl = this.gl;

            if (!baseTexture._glRenderTargets[this.CONTEXT_UID])
            {
                this.textureManager.updateTexture(baseTexture);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            else
            {
                // the texture needs to be unbound if its being rendererd too..
                this._activeTextureLocation = baseTexture._id;
                gl.activeTexture(gl.TEXTURE0 + baseTexture._id);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            renderTarget = baseTexture._glRenderTargets[this.CONTEXT_UID];
            renderTarget.setFrame(renderTexture.frame);
        }
        else
        {
            renderTarget = this.rootRenderTarget;
        }

        renderTarget.transform = transform;
        this.bindRenderTarget(renderTarget);

        return this;
    }

    /**
     * Changes the current render target to the one given in parameter
     *
     * @param {PIXI.RenderTarget} renderTarget - the new render target
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindRenderTarget(renderTarget)
    {
        if (renderTarget !== this._activeRenderTarget)
        {
            this._activeRenderTarget = renderTarget;
            renderTarget.activate();

            if (this._activeShader)
            {
                this._activeShader.uniforms.projectionMatrix = renderTarget.projectionMatrix.toArray(true);
            }

            this.stencilManager.setMaskStack(renderTarget.stencilMaskStack);
        }

        return this;
    }

    /**
     * Changes the current shader to the one given in parameter
     *
     * @param {PIXI.Shader} shader - the new shader
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindShader(shader)
    {
        // TODO cache
        if (this._activeShader !== shader)
        {
            this._activeShader = shader;
            shader.bind();

            // automatically set the projection matrix
            shader.uniforms.projectionMatrix = this._activeRenderTarget.projectionMatrix.toArray(true);
        }

        return this;
    }

    /**
     * Binds the texture ... @mat
     *
     * @param {PIXI.Texture} texture - the new texture
     * @param {number} location - the texture location
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindTexture(texture, location = 0)
    {
        texture = texture.baseTexture || texture;

        const gl = this.gl;

        // TODO test perf of cache?

        if (this._activeTextureLocation !== location)//
        {
            this._activeTextureLocation = location;
            gl.activeTexture(gl.TEXTURE0 + location);
        }

        // TODO - can we cache this texture too?
        this._activeTexture = texture;

        if (!texture._glTextures[this.CONTEXT_UID])
        {
            // this will also bind the texture..
            this.textureManager.updateTexture(texture);
        }
        else
        {
            texture.touched = this.textureGC.count;
            // bind the current texture
            texture._glTextures[this.CONTEXT_UID].bind();
        }

        return this;
    }

    /**
     * Creates a new VAO from this renderer's context and state.
     *
     * @return {VertexArrayObject} The new VAO.
     */
    createVao()
    {
        return new glCore.VertexArrayObject(this.gl, this.state.attribState);
    }

    /**
     * Resets the WebGL state so you can render things however you fancy!
     *
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    reset()
    {
        this.setObjectRenderer(this.emptyRenderer);

        this._activeShader = null;
        this._activeRenderTarget = this.rootRenderTarget;
        this._activeTextureLocation = 999;
        this._activeTexture = null;

        // bind the main frame buffer (the screen);
        this.rootRenderTarget.activate();

        this.state.resetToDefault();

        return this;
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
        this._initContext();
        this.textureManager.removeAll();
    }

    /**
     * Removes everything from the renderer (event listeners, spritebatch, etc...)
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     *  See: https://github.com/pixijs/pixi.js/issues/2233
     */
    destroy(removeView)
    {
        this.destroyPlugins();

        // remove listeners
        this.view.removeEventListener('webglcontextlost', this.handleContextLost);
        this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.textureManager.destroy();

        // call base destroy
        super.destroy(removeView);

        this.uid = 0;

        // destroy the managers
        this.maskManager.destroy();
        this.stencilManager.destroy();
        this.filterManager.destroy();

        this.maskManager = null;
        this.filterManager = null;
        this.textureManager = null;
        this.currentRenderer = null;

        this.handleContextLost = null;
        this.handleContextRestored = null;

        this._contextOptions = null;
        this.gl.useProgram(null);

        if (this.gl.getExtension('WEBGL_lose_context'))
        {
            this.gl.getExtension('WEBGL_lose_context').loseContext();
        }

        this.gl = null;

        // this = null;
    }
}

pluginTarget.mixin(WebGLRenderer);

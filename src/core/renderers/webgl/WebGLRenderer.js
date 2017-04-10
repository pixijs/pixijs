import SystemRenderer from '../SystemRenderer';
import MaskManager from './managers/MaskManager';
import StencilManager from './managers/StencilManager';
import FilterManager from './managers/FilterManager';
import RenderTarget from './utils/RenderTarget';
import ObjectRenderer from './utils/ObjectRenderer';
import TextureManager from './TextureManager';
import BaseTexture from '../../textures/BaseTexture';
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
    // eslint-disable-next-line valid-jsdoc
    /**
     *
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
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
     * @param {boolean} [options.legacy=false] - If true Pixi will aim to ensure compatibility
     * with older / less advanced devices. If you experiance unexplained flickering try setting this to true.
     */
    constructor(options, arg2, arg3)
    {
        super('WebGL', options, arg2, arg3);

        this.legacy = this.options.legacy;

        if (this.legacy)
        {
            glCore.VertexArrayObject.FORCE_NATIVE = true;
        }

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
            antialias: this.options.antialias,
            premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
            stencil: true,
            preserveDrawingBuffer: this.options.preserveDrawingBuffer,
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
        if (this.options.context)
        {
            // checks to see if a context is valid..
            validateContext(this.options.context);
        }

        this.gl = this.options.context || glCore.createContext(this.view, this._contextOptions);

        this.CONTEXT_UID = CONTEXT_UID++;

        /**
         * The currently active ObjectRenderer.
         *
         * @member {PIXI.WebGLState}
         */
        this.state = new WebGLState(this.gl);

        this.renderingToScreen = true;

        /**
         * Holds the current state of textures bound to the GPU.
         * @type {Array}
         */
        this.boundTextures = null;

        /**
         * Holds the current shader
         *
         * @member {PIXI.Shader}
         */
        this._activeShader = null;

        this._activeVao = null;

        /**
         * Holds the current render target
         *
         * @member {PIXI.RenderTarget}
         */
        this._activeRenderTarget = null;

        this._initContext();

        /**
         * Manages the filters.
         *
         * @member {PIXI.FilterManager}
         */
        this.filterManager = new FilterManager(this);
        // map some webGL blend and drawmodes..
        this.drawModes = mapWebGLDrawModesToPixi(this.gl);

        this._nextTextureLocation = 0;

        this.setBlendMode(0);

        /**
         * Fired after rendering finishes.
         *
         * @event PIXI.WebGLRenderer#postrender
         */

        /**
         * Fired before rendering starts.
         *
         * @event PIXI.WebGLRenderer#prerender
         */

        /**
         * Fired when the WebGL context is set.
         *
         * @event PIXI.WebGLRenderer#context
         * @param {WebGLRenderingContext} gl - WebGL context.
         */
    }

    /**
     * Creates the WebGL context
     *
     * @private
     */
    _initContext()
    {
        const gl = this.gl;

        // restore a context if it was previously lost
        if (gl.isContextLost() && gl.getExtension('WEBGL_lose_context'))
        {
            gl.getExtension('WEBGL_lose_context').restoreContext();
        }

        const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        this.boundTextures = new Array(maxTextures);
        this.emptyTextures = new Array(maxTextures);

        // create a texture manager...
        this.textureManager = new TextureManager(this);
        this.textureGC = new TextureGarbageCollector(this);

        this.state.resetToDefault();

        this.rootRenderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);
        this.rootRenderTarget.clearColor = this._backgroundColorRgba;

        this.bindRenderTarget(this.rootRenderTarget);

        // now lets fill up the textures with empty ones!
        const emptyGLTexture = new glCore.GLTexture.fromData(gl, null, 1, 1);

        const tempObj = { _glTextures: {} };

        tempObj._glTextures[this.CONTEXT_UID] = {};

        for (let i = 0; i < maxTextures; i++)
        {
            const empty = new BaseTexture();

            empty._glTextures[this.CONTEXT_UID] = emptyGLTexture;

            this.boundTextures[i] = tempObj;
            this.emptyTextures[i] = empty;
            this.bindTexture(null, i);
        }

        this.emit('context', gl);

        // setup the width/height properties and gl viewport
        this.resize(this.screen.width, this.screen.height);
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

        this._nextTextureLocation = 0;

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
     * This should be called if you wish to do some custom rendering
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
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    resize(screenWidth, screenHeight)
    {
      //  if(width * this.resolution === this.width && height * this.resolution === this.height)return;

        SystemRenderer.prototype.resize.call(this, screenWidth, screenHeight);

        this.rootRenderTarget.resize(screenWidth, screenHeight);

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
     * Erases the render texture and fills the drawing area with a colour
     *
     * @param {PIXI.RenderTexture} renderTexture - The render texture to clear
     * @param {number} [clearColor] - The colour
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    clearRenderTexture(renderTexture, clearColor)
    {
        const baseTexture = renderTexture.baseTexture;
        const renderTarget = baseTexture._glRenderTargets[this.CONTEXT_UID];

        if (renderTarget)
        {
            renderTarget.clear(clearColor);
        }

        return this;
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

            if (!baseTexture._glRenderTargets[this.CONTEXT_UID])
            {
                // bind the current texture
                this.textureManager.updateTexture(baseTexture, 0);
            }

            this.unbindTexture(baseTexture);

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
     * @param {boolean} [autoProject=true] - Whether automatically set the projection matrix
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindShader(shader, autoProject)
    {
        // TODO cache
        if (this._activeShader !== shader)
        {
            this._activeShader = shader;
            shader.bind();

            // `autoProject` normally would be a default parameter set to true
            // but because of how Babel transpiles default parameters
            // it hinders the performance of this method.
            if (autoProject !== false)
            {
                // automatically set the projection matrix
                shader.uniforms.projectionMatrix = this._activeRenderTarget.projectionMatrix.toArray(true);
            }
        }

        return this;
    }

    /**
     * Binds the texture. This will return the location of the bound texture.
     * It may not be the same as the one you pass in. This is due to optimisation that prevents
     * needless binding of textures. For example if the texture is already bound it will return the
     * current location of the texture instead of the one provided. To bypass this use force location
     *
     * @param {PIXI.Texture} texture - the new texture
     * @param {number} location - the suggested texture location
     * @param {boolean} forceLocation - force the location
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindTexture(texture, location, forceLocation)
    {
        texture = texture || this.emptyTextures[location];
        texture = texture.baseTexture || texture;
        texture.touched = this.textureGC.count;

        if (!forceLocation)
        {
            // TODO - maybe look into adding boundIds.. save us the loop?
            for (let i = 0; i < this.boundTextures.length; i++)
            {
                if (this.boundTextures[i] === texture)
                {
                    return i;
                }
            }

            if (location === undefined)
            {
                this._nextTextureLocation++;
                this._nextTextureLocation %= this.boundTextures.length;
                location = this.boundTextures.length - this._nextTextureLocation - 1;
            }
        }
        else
        {
            location = location || 0;
        }

        const gl = this.gl;
        const glTexture = texture._glTextures[this.CONTEXT_UID];

        if (!glTexture)
        {
            // this will also bind the texture..
            this.textureManager.updateTexture(texture, location);
        }
        else
        {
            // bind the current texture
            this.boundTextures[location] = texture;
            gl.activeTexture(gl.TEXTURE0 + location);
            gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);
        }

        return location;
    }

     /**
     * unbinds the texture ...
     *
     * @param {PIXI.Texture} texture - the texture to unbind
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    unbindTexture(texture)
    {
        const gl = this.gl;

        texture = texture.baseTexture || texture;

        for (let i = 0; i < this.boundTextures.length; i++)
        {
            if (this.boundTextures[i] === texture)
            {
                this.boundTextures[i] = this.emptyTextures[i];

                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[i]._glTextures[this.CONTEXT_UID].texture);
            }
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
     * Changes the current Vao to the one given in parameter
     *
     * @param {PIXI.VertexArrayObject} vao - the new Vao
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindVao(vao)
    {
        if (this._activeVao === vao)
        {
            return this;
        }

        if (vao)
        {
            vao.bind();
        }
        else if (this._activeVao)
        {
            // TODO this should always be true i think?
            this._activeVao.unbind();
        }

        this._activeVao = vao;

        return this;
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

/**
 * Collection of installed plugins. These are included by default in PIXI, but can be excluded
 * by creating a custom build. Consult the README for more information about creating custom
 * builds and excluding plugins.
 * @name PIXI.WebGLRenderer#plugins
 * @type {object}
 * @readonly
 * @property {PIXI.accessibility.AccessibilityManager} accessibility Support tabbing interactive elements.
 * @property {PIXI.extract.WebGLExtract} extract Extract image data from renderer.
 * @property {PIXI.interaction.InteractionManager} interaction Handles mouse, touch and pointer events.
 * @property {PIXI.prepare.WebGLPrepare} prepare Pre-render display objects.
 */

/**
 * Adds a plugin to the renderer.
 *
 * @method PIXI.WebGLRenderer#registerPlugin
 * @param {string} pluginName - The name of the plugin.
 * @param {Function} ctor - The constructor function or class for the plugin.
 */

pluginTarget.mixin(WebGLRenderer);

var SystemRenderer = require('../SystemRenderer'),
    MaskManager = require('./managers/MaskManager'),
    StencilManager = require('./managers/StencilManager'),
    FilterManager = require('./managers/FilterManager'),
    BlendModeManager = require('./managers/BlendModeManager'),
    RenderTarget = require('./utils/RenderTarget'),
    ObjectRenderer = require('./utils/ObjectRenderer'),
    TextureManager = require('./TextureManager'),
    RenderTextureManager = require('./RenderTextureManager'),
    WebGLState = require('./WebGLState'),
    createContext = require('pixi-gl-core').createContext,
    mapWebGLBlendModesToPixi = require('./utils/mapWebGLBlendModesToPixi'),
    mapWebGLDrawModesToPixi = require('./utils/mapWebGLDrawModesToPixi'),
    utils = require('../../utils'),
    CONST = require('../../const');

var CONTEXT_UID = 0;

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always look as great
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass. If you wish to set this to false, you *must* set preserveDrawingBuffer to `true`.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function WebGLRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'WebGL', width, height, options);

    /**
     * The type of this renderer as a standardised const
     *
     * @member {number}//
     *
     */
    this.type = CONST.RENDERER_TYPE.WEBGL;

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
        preserveDrawingBuffer: options.preserveDrawingBuffer
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

    this.blendModeManager = new BlendModeManager(this);

    /**
     * The currently active ObjectRenderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    this.currentRenderer = new ObjectRenderer(this);

    this.initPlugins();

    // initialize the context so it is ready for the managers.
    this.gl = createContext(this.view, this._contextOptions);
    this.gl.id = CONTEXT_UID++; // could pool?

    this.state = new WebGLState(this.gl);


    /**
     * Manages the filters.
     *
     * @member {PIXI.FilterManager}
     */
   
    
    this._initContext();
  
     this.filterManager = new FilterManager(this);
    // map some webGL blend and drawmodes..
    this.blendModes = mapWebGLBlendModesToPixi(gl);
    this.drawModes = mapWebGLDrawModesToPixi(gl)

    
    //alert(this.state )
    this._activeShader = null;

    /**
     * Holds the current render target
     *
     * @member {PIXI.RenderTarget}
     */
    this._activeRenderTarget = null;
    this._activeTextureLocation = null;
    this._activeTexture = null;
}

// constructor
WebGLRenderer.prototype = Object.create(SystemRenderer.prototype);
WebGLRenderer.prototype.constructor = WebGLRenderer;
module.exports = WebGLRenderer;
utils.pluginTarget.mixin(WebGLRenderer);

/**
 * Creates the WebGL context
 *
 * @private
 */
WebGLRenderer.prototype._initContext = function ()
{
    var gl = this.gl;

    

    // create a texture manager...
    this.textureManager = new TextureManager(gl);
    this.renderTextureManager = new RenderTextureManager(gl);
    
    this.state.resetToDefault();

    this.rootRenderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);
    this.rootRenderTarget.clearColor = this._backgroundColorRgba;
    
    this.bindRenderTarget(this.rootRenderTarget);

    this.emit('context', gl);

    // setup the width/height properties and gl viewport
    this.resize(this.width, this.height);    
};

/**
 * Renders the object to its webGL view
 *
 * @param object {PIXI.DisplayObject} the object to be rendered
 */
WebGLRenderer.prototype.render = function (displayObject, renderTexture, clear, doNotUpdateTransform)
{
    this.emit('prerender');

    // no point rendering if our context has been blown up!
    if (this.gl.isContextLost())
    {
        return;
    }

    this._lastObjectRendered = displayObject;

    if(!doNotUpdateTransform)
    {       
        // update the scene graph
        var cacheParent = displayObject.parent;
        displayObject.parent = this._tempDisplayObjectParent;
        displayObject.updateTransform();
        displayObject.parent = cacheParent;
    }

    //TODO - do we need renderDisplayObject?
    var renderTarget = this.rootRenderTarget;
    var clear = clear || this.clearBeforeRender;

    // MOVE OUT?
    if(renderTexture)
    {
        var baseTexture = renderTexture.baseTexture;

        if(!baseTexture._glRenderTargets[gl.id])
        {
            this.renderTextureManager.updateTexture(baseTexture);
        }

        renderTarget =  baseTexture._glRenderTargets[gl.id];
    }

    this.bindRenderTarget(renderTarget);
    
    if(clear)
    {
        renderTarget.clear();
    }


    displayObject.renderWebGL(this);

    this.currentRenderer.flush();

    this.emit('postrender');
};

/**
 * Changes the current renderer to the one given in parameter
 *
 * @param objectRenderer {PIXI.ObjectRenderer} The object renderer to use.
 */
WebGLRenderer.prototype.setObjectRenderer = function (objectRenderer)
{
    if (this.currentRenderer === objectRenderer)
    {
        return;
    }

    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
};

/**
 * Resizes the webGL view to the specified width and height.
 *
 * @param width {number} the new width of the webGL view
 * @param height {number} the new height of the webGL view
 */
WebGLRenderer.prototype.resize = function (width, height)
{
    SystemRenderer.prototype.resize.call(this, width, height);

    this.rootRenderTarget.resize(width, height);


    if(this._activeRenderTarget === this.rootRenderTarget)
    {
        this.rootRenderTarget.activate();

        if(this._activeShader)
        {
            this._activeShader.uniforms.projectionMatrix = this.rootRenderTarget.projectionMatrix.toArray(true);
        }
    }
};

WebGLRenderer.prototype.setBlendMode = function (mode)
{
    // fill in here..
}

WebGLRenderer.prototype.clear = function (clearColor)
{
    this._activeRenderTarget.clear(clearColor);
}

//TOOD - required?
WebGLRenderer.prototype.bindRenderTexture = function (renderTexture)
{
    this.bindRenderTarget( renderTexture.baseTexture.textureBuffer, renderTexture.frame );

    return this;
}

/**
 * Changes the current render target to the one given in parameter
 *
 * @param renderTarget {PIXI.RenderTarget} the new render target
 */
WebGLRenderer.prototype.bindRenderTarget = function (renderTarget, destinationFrame, sourceFrame)
{
    if(renderTarget !== this._activeRenderTarget)
    {
        this._activeRenderTarget = renderTarget;
        renderTarget.activate(destinationFrame, sourceFrame);

        if(this._activeShader)
        {
            this._activeShader.uniforms.projectionMatrix = renderTarget.projectionMatrix.toArray(true);
        }


        this.stencilManager.setMaskStack( renderTarget.stencilMaskStack );
    }

    return this;
}


WebGLRenderer.prototype.bindShader = function (shader)
{
    //TODO cache
    if(this._activeShader !== shader)
    {
        this._activeShader = shader;
        shader.bind();

        // automatically set the projection matrix
        shader.uniforms.projectionMatrix = this._activeRenderTarget.projectionMatrix.toArray(true);
    }

    return this;
}


WebGLRenderer.prototype.bindTexture = function (texture, location)
{
    texture = texture.baseTexture || texture;
    
    var gl = this.gl;

    //TODO test perf of cache?
    location = location || 0;

    if(this._activeTextureLocation !== location)//
    {
        this._activeTextureLocation = location
        gl.activeTexture(gl.TEXTURE0 + location );
    }

    //TODO - can we cache this texture too?
    this._activeTexture = texture;      
    
    if (!texture._glTextures[gl.id])
    {
        // this will also bind the texture..
        this.textureManager.updateTexture(texture);
    }
    else
    {   
        // bind the current texture
        texture._glTextures[gl.id].bind();
    }

    return this;
}

/**
 * resets WebGL state so you can render things however you fancy!
 * @return {[type]} [description]
 */
WebGLRenderer.prototype.reset = function ()
{
    this._activeShader = null;
    this._activeRenderTarget = null;

    // bind the main frame buffer (the screen);
    this.rootRenderTarget.activate();

    this.state.reset();

    return this;
}

/**
 * Handles a lost webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextLost = function (event)
{
    event.preventDefault();
};

/**
 * Handles a restored webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextRestored = function ()
{
    this._initContext();
    this.textureManager.removeAll();
};

/**
 * Removes everything from the renderer (event listeners, spritebatch, etc...)
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
WebGLRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // remove listeners
    this.view.removeEventListener('webglcontextlost', this.handleContextLost);
    this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.textureManager.destroyAll();

    // call base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.uid = 0;

    // destroy the managers
    this.maskManager.destroy();
    this.stencilManager.destroy();
    this.filterManager.destroy();

    this.maskManager = null;
    this.filterManager = null;
    this.currentRenderer = null;

    this.handleContextLost = null;
    this.handleContextRestored = null;

    this._contextOptions = null;

    this.gl.useProgram(null);
    this.gl = null;
};


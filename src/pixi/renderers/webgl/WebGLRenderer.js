/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.glContexts = []; // this is where we store the webGL contexts for easy access.

/**
 * The WebGLRenderer draws the stage and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class WebGLRenderer
 * @constructor
 * @param [width=0] {Number} the width of the canvas view
 * @param [height=0] {Number} the height of the canvas view
 * @param [options] {Object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {Boolean} If the render view is transparent, default false
 * @param [options.antialias=false] {Boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.preserveDrawingBuffer=false] {Boolean} enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context
 * @param [options.resolution=1] {Number} the resolution of the renderer retina would be 2
 */
PIXI.WebGLRenderer = function(width, height, options)
{
    if(options)
    {
        for (var i in PIXI.defaultRenderOptions)
        {
            if (typeof options[i] === 'undefined') options[i] = PIXI.defaultRenderOptions[i];
        }
    }
    else
    {
        options = PIXI.defaultRenderOptions;
    }

    if(!PIXI.defaultRenderer)
    {
        PIXI.sayHello('webGL');
        PIXI.defaultRenderer = this;
    }

    /**
     * @property type
     * @type Number
     */
    this.type = PIXI.WEBGL_RENDERER;

    /**
     * The resolution of the renderer
     *
     * @property resolution
     * @type Number
     * @default 1
     */
    this.resolution = options.resolution;

    // do a catch.. only 1 webGL renderer..

    /**
     * Whether the render view is transparent
     *
     * @property transparent
     * @type Boolean
     */
    this.transparent = options.transparent;

    /**
     * The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
     *
     * @property preserveDrawingBuffer
     * @type Boolean
     */
    this.preserveDrawingBuffer = options.preserveDrawingBuffer;
    
    /**
     * This sets if the WebGLRenderer will clear the context texture or not before the new render pass. If true:
     * If the Stage is NOT transparent, Pixi will clear to alpha (0, 0, 0, 0).
     * If the Stage is transparent, Pixi will clear to the target Stage's background color.
     * Disable this by setting this to false. For example: if your game has a canvas filling background image, you often don't need this set.
     *
     * @property clearBeforeRender
     * @type Boolean
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;
    
    /**
     * The width of the canvas view
     *
     * @property width
     * @type Number
     * @default 800
     */
    this.width = width || 800;

    /**
     * The height of the canvas view
     *
     * @property height
     * @type Number
     * @default 600
     */
    this.height = height || 600;

    /**
     * The canvas element that everything is drawn to
     *
     * @property view
     * @type HTMLCanvasElement
     */
    this.view = options.view || document.createElement( 'canvas' );

    // deal with losing context..

    /**
     * @property contextLostBound
     * @type Function
     */
    this.contextLostBound = this.handleContextLost.bind(this);

    /**
     * @property contextRestoredBound
     * @type Function
     */
    this.contextRestoredBound = this.handleContextRestored.bind(this);

    this.view.addEventListener('webglcontextlost', this.contextLostBound, false);
    this.view.addEventListener('webglcontextrestored', this.contextRestoredBound, false);

    /**
     * @property _contextOptions
     * @type Object
     * @private
     */
    this._contextOptions = {
        alpha: this.transparent,
        antialias: options.antialias, // SPEED UP??
        premultipliedAlpha:this.transparent && this.transparent !== 'notMultiplied',
        stencil:true,
        preserveDrawingBuffer: options.preserveDrawingBuffer
    };

    /**
     * @property projection
     * @type Point
     */
    this.projection = new PIXI.Point();

    /**
     * @property offset
     * @type Point
     */
    this.offset = new PIXI.Point(0, 0);

    // time to create the render managers! each one focuses on managing a state in webGL

    /**
     * Deals with managing the shader programs and their attribs
     * @property shaderManager
     * @type WebGLShaderManager
     */
    this.shaderManager = new PIXI.WebGLShaderManager();

    /**
     * Manages the rendering of sprites
     * @property spriteBatch
     * @type WebGLSpriteBatch
     */
    this.spriteBatch = new PIXI.WebGLSpriteBatch();

    /**
     * Manages the masks using the stencil buffer
     * @property maskManager
     * @type WebGLMaskManager
     */
    this.maskManager = new PIXI.WebGLMaskManager();

    /**
     * Manages the filters
     * @property filterManager
     * @type WebGLFilterManager
     */
    this.filterManager = new PIXI.WebGLFilterManager();

    /**
     * Manages the stencil buffer
     * @property stencilManager
     * @type WebGLStencilManager
     */
    this.stencilManager = new PIXI.WebGLStencilManager();

    /**
     * Manages the blendModes
     * @property blendModeManager
     * @type WebGLBlendModeManager
     */
    this.blendModeManager = new PIXI.WebGLBlendModeManager();

    /**
     * TODO remove
     * @property renderSession
     * @type Object
     */
    this.renderSession = {};
    this.renderSession.gl = this.gl;
    this.renderSession.drawCount = 0;
    this.renderSession.shaderManager = this.shaderManager;
    this.renderSession.maskManager = this.maskManager;
    this.renderSession.filterManager = this.filterManager;
    this.renderSession.blendModeManager = this.blendModeManager;
    this.renderSession.spriteBatch = this.spriteBatch;
    this.renderSession.stencilManager = this.stencilManager;
    this.renderSession.renderer = this;
    this.renderSession.resolution = this.resolution;

    // time init the context..
    this.initContext();

    // map some webGL blend modes..
    this.mapBlendModes();
};

// constructor
PIXI.WebGLRenderer.prototype.constructor = PIXI.WebGLRenderer;

/**
* @method initContext
*/
PIXI.WebGLRenderer.prototype.initContext = function()
{
    var gl = this.view.getContext('webgl', this._contextOptions) || this.view.getContext('experimental-webgl', this._contextOptions);
    this.gl = gl;

    if (!gl) {
        // fail, not able to get a context
        throw new Error('This browser does not support webGL. Try using the canvas renderer');
    }

    this.glContextId = gl.id = PIXI.WebGLRenderer.glContextId ++;

    PIXI.glContexts[this.glContextId] = gl;

    // set up the default pixi settings..
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    // need to set the context for all the managers...
    this.shaderManager.setContext(gl);
    this.spriteBatch.setContext(gl);
    this.maskManager.setContext(gl);
    this.filterManager.setContext(gl);
    this.blendModeManager.setContext(gl);
    this.stencilManager.setContext(gl);

    this.renderSession.gl = this.gl;

    // now resize and we are good to go!
    this.resize(this.width, this.height);
};

/**
 * Renders the stage to its webGL view
 *
 * @method render
 * @param stage {Stage} the Stage element to be rendered
 */
PIXI.WebGLRenderer.prototype.render = function(stage)
{
    // no point rendering if our context has been blown up!
    if(this.contextLost)return;

    // if rendering a new stage clear the batches..
    if(this.__stage !== stage)
    {
        if(stage.interactive)stage.interactionManager.removeEvents();

        // TODO make this work
        // dont think this is needed any more?
        this.__stage = stage;
    }

    // update the scene graph
    stage.updateTransform();

    var gl = this.gl;
    
    // interaction
    if(stage._interactive)
    {
        //need to add some events!
        if(!stage._interactiveEventsAdded)
        {
            stage._interactiveEventsAdded = true;
            stage.interactionManager.setTarget(this);
        }
    }
    else
    {
        if(stage._interactiveEventsAdded)
        {
            stage._interactiveEventsAdded = false;
            stage.interactionManager.setTarget(this);
        }
    }

    // -- Does this need to be set every frame? -- //
    gl.viewport(0, 0, this.width, this.height);

    // make sure we are bound to the main frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (this.clearBeforeRender)
        {
        if(this.transparent)
        {
            gl.clearColor(0, 0, 0, 0);
        }
        else
        {
            gl.clearColor(stage.backgroundColorSplit[0],stage.backgroundColorSplit[1],stage.backgroundColorSplit[2], 1);
        }
        
        gl.clear (gl.COLOR_BUFFER_BIT);
    }
    
    this.renderDisplayObject( stage, this.projection );
};

/**
 * Renders a Display Object.
 *
 * @method renderDisplayObject
 * @param displayObject {DisplayObject} The DisplayObject to render
 * @param projection {Point} The projection
 * @param buffer {Array} a standard WebGL buffer
 */
PIXI.WebGLRenderer.prototype.renderDisplayObject = function(displayObject, projection, buffer)
{
    this.renderSession.blendModeManager.setBlendMode(PIXI.blendModes.NORMAL);
   
    // reset the render session data..
    this.renderSession.drawCount = 0;

    // set the default projection
    this.renderSession.projection = projection;

    //set the default offset
    this.renderSession.offset = this.offset;

    // start the sprite batch
    this.spriteBatch.begin(this.renderSession);

    // start the filter manager
    this.filterManager.begin(this.renderSession, buffer);

    // render the scene!
    displayObject._renderWebGL(this.renderSession);

    // finish the sprite batch
    this.spriteBatch.end();
};

/**
 * Resizes the webGL view to the specified width and height.
 *
 * @method resize
 * @param width {Number} the new width of the webGL view
 * @param height {Number} the new height of the webGL view
 */
PIXI.WebGLRenderer.prototype.resize = function(width, height)
{
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    this.gl.viewport(0, 0, this.width, this.height);

    this.projection.x =  this.width / 2 / this.resolution;
    this.projection.y =  -this.height / 2 / this.resolution;
};

/**
 * Updates and Creates a WebGL texture for the renderers context.
 *
 * @method updateTexture
 * @param texture {Texture} the texture to update
 */
PIXI.WebGLRenderer.prototype.updateTexture = function(texture)
{
    if(!texture.hasLoaded )return;

    var gl = this.gl;

    if(!texture._glTextures[gl.id])texture._glTextures[gl.id] = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);

    // reguler...
    if(!texture._powerOf2)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    texture._dirty[gl.id] = false;

    return  texture._glTextures[gl.id];
};

/**
 * Handles a lost webgl context
 *
 * @method handleContextLost
 * @param event {Event}
 * @private
 */
PIXI.WebGLRenderer.prototype.handleContextLost = function(event)
{
    event.preventDefault();
    this.contextLost = true;
};

/**
 * Handles a restored webgl context
 *
 * @method handleContextRestored
 * @param event {Event}
 * @private
 */
PIXI.WebGLRenderer.prototype.handleContextRestored = function()
{
    this.initContext();

    // empty all the ol gl textures as they are useless now
    for(var key in PIXI.TextureCache)
    {
        var texture = PIXI.TextureCache[key].baseTexture;
        texture._glTextures = [];
    }
    
    this.contextLost = false;
};

/**
 * Removes everything from the renderer (event listeners, spritebatch, etc...)
 *
 * @method destroy
 */
PIXI.WebGLRenderer.prototype.destroy = function()
{
    // remove listeners
    this.view.off('webglcontextlost', this.contextLostBound);
    this.view.off('webglcontextrestored', this.contextRestoredBound);

    PIXI.glContexts[this.glContextId] = null;

    this.projection = null;
    this.offset = null;

    // time to create the render managers! each one focuses on managine a state in webGL
    this.shaderManager.destroy();
    this.spriteBatch.destroy();
    this.maskManager.destroy();
    this.filterManager.destroy();

    this.shaderManager = null;
    this.spriteBatch = null;
    this.maskManager = null;
    this.filterManager = null;

    this.gl = null;
    this.renderSession = null;
};

/**
 * Maps Pixi blend modes to WebGL blend modes.
 *
 * @method mapBlendModes
 */
PIXI.WebGLRenderer.prototype.mapBlendModes = function()
{
    var gl = this.gl;

    if(!PIXI.blendModesWebGL)
    {
        PIXI.blendModesWebGL = [];

        PIXI.blendModesWebGL[PIXI.blendModes.NORMAL]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.ADD]           = [gl.SRC_ALPHA, gl.DST_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.MULTIPLY]      = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.SCREEN]        = [gl.SRC_ALPHA, gl.ONE];
        PIXI.blendModesWebGL[PIXI.blendModes.OVERLAY]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.DARKEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.LIGHTEN]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.COLOR_DODGE]   = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.COLOR_BURN]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.HARD_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.SOFT_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.DIFFERENCE]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.EXCLUSION]     = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.HUE]           = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.SATURATION]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.COLOR]         = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        PIXI.blendModesWebGL[PIXI.blendModes.LUMINOSITY]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    }
};

PIXI.WebGLRenderer.glContextId = 0;

var WebGLFastSpriteBatch = require('./utils/WebGLFastSpriteBatch'),
    WebGLShaderManager = require('./managers/WebGLShaderManager'),
    WebGLMaskManager = require('./managers/WebGLMaskManager'),
    WebGLFilterManager = require('./managers/WebGLFilterManager'),
    WebGLBlendModeManager = require('./managers/WebGLBlendModeManager'),
    RenderTarget = require('./utils/RenderTarget'),
    ObjectRenderer = require('./utils/ObjectRenderer'),
    math = require('../../math'),
    utils = require('../../utils'),

    CONST = require('../../const');

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @namespace PIXI
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 */
function WebGLRenderer(width, height, options)
{
    utils.sayHello('webGL');

    if (options)
    {
        for (var i in CONST.defaultRenderOptions)
        {
            if (typeof options[i] === 'undefined')
            {
                options[i] = CONST.defaultRenderOptions[i];
            }
        }
    }
    else
    {
        options = CONST.defaultRenderOptions;
    }

    this.uuid = utils.uuid();

    /**
     * @member {number}
     */
    this.type = CONST.WEBGL_RENDERER;

    /**
     * The resolution of the renderer
     *
     * @member {number}
     * @default 1
     */
    this.resolution = options.resolution;

    // do a catch.. only 1 webGL renderer..

    /**
     * Whether the render view is transparent
     *
     * @member {boolean}
     */
    this.transparent = options.transparent;

    /**
     * The background color as a number.
     *
     * @member {number}
     * @private
     */
    this._backgroundColor = 0xFFFFFF;

    /**
     * The background color as an [R, G, B] array.
     *
     * @member {number[]}
     * @private
     */
    this._backgroundColorRgb = [0, 0, 0];

    this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

    /**
     * Whether the render view should be resized automatically
     *
     * @member {boolean}
     */
    this.autoResize = options.autoResize || false;

    /**
     * The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
     *
     * @member {boolean}
     */
    this.preserveDrawingBuffer = options.preserveDrawingBuffer;

    /**
     * This sets if the WebGLRenderer will clear the context texture or not before the new render pass. If true:
     * If the renderer is NOT transparent, Pixi will clear to alpha (0, 0, 0, 0).
     * If the renderer is transparent, Pixi will clear to the target Stage's background color.
     * Disable this by setting this to false. For example: if your game has a canvas filling background image, you often don't need this set.
     *
     * @member {boolean}
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;

    /**
     * The width of the canvas view
     *
     * @member {number}
     * @default 800
     */
    this.width = width || 800;

    /**
     * The height of the canvas view
     *
     * @member {number}
     * @default 600
     */
    this.height = height || 600;

    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.view = options.view || document.createElement( 'canvas' );

    // deal with losing context..

    /**
     * @member {Function}
     */
    this.contextLostBound = this.handleContextLost.bind(this);

    /**
     * @member {Function}
     */
    this.contextRestoredBound = this.handleContextRestored.bind(this);

    this.view.addEventListener('webglcontextlost', this.contextLostBound, false);
    this.view.addEventListener('webglcontextrestored', this.contextRestoredBound, false);

    /**
     * @member {object}
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
     * @member {Point}
     */
    this.projection = new math.Point();

    /**
     * @member {Point}
     */
    this.offset = new math.Point(0, 0);

    /**
     * Counter for the number of draws made each frame
     *
     * @member {number}
     */
    this.drawCount = 0;

    // time to create the render managers! each one focuses on managing a state in webGL

    /**
     * Deals with managing the shader programs and their attribs
     * @member {WebGLShaderManager}
     */
    this.shaderManager = new WebGLShaderManager(this);

    /**
     * Manages the rendering of sprites
     * @member {WebGLFastSpriteBatch}
     */
    this.fastSpriteBatch = new WebGLFastSpriteBatch(this);

    /**
     * Manages the masks using the stencil buffer
     * @member {WebGLMaskManager}
     */
    this.maskManager = new WebGLMaskManager(this);

    /**
     * Manages the filters
     * @member {WebGLFilterManager}
     */
    this.filterManager = new WebGLFilterManager(this);

    /**
     * Manages the blendModes
     * @member {WebGLBlendModeManager}
     */
    this.blendModeManager = new WebGLBlendModeManager(this);

    

    this.blendModes = null;

    this._boundUpdateTexture = this.updateTexture.bind(this);
    this._boundDestroyTexture = this.destroyTexture.bind(this);

    

    // time init the context..
    this._initContext();

    this.currentRenderTarget = this.renderTarget;

    // map some webGL blend modes..
    this._mapBlendModes();

    /**
     * This temporary display object used as the parent of the currently being rendered item
     * @member DisplayObject
     * @private
     */
    this._tempDisplayObjectParent = {worldTransform:new math.Matrix(), worldAlpha:1};

    /**
     * Manages the renderer of specific objects.
     *
     * @member {object<string, ObjectRenderer>}
     */
    this.objectRenderers = {};

    this.currentRenderer = new ObjectRenderer();
    
    // create an instance of each registered object renderer
    for (var o in WebGLRenderer._objectRenderers) {
        this.objectRenderers[o] = new (WebGLRenderer._objectRenderers[o])(this);
    }


}

// constructor
WebGLRenderer.prototype.constructor = WebGLRenderer;
module.exports = WebGLRenderer;

utils.eventTarget.mixin(WebGLRenderer.prototype);

Object.defineProperties(WebGLRenderer.prototype, {
    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     * @memberof WebGLRenderer#
     */
    backgroundColor:
    {
        get: function ()
        {
            return this._backgroundColor;
        },
        set: function (val)
        {
            this._backgroundColor = val;
            utils.hex2rgb(val, this._backgroundColorRgb);
        }
    }
});

/**
 *
 * @private
 */
WebGLRenderer.prototype._initContext = function ()
{
    var gl = this.view.getContext('webgl', this._contextOptions) || this.view.getContext('experimental-webgl', this._contextOptions);
    this.gl = gl;

    if (!gl)
    {
        // fail, not able to get a context
        throw new Error('This browser does not support webGL. Try using the canvas renderer');
    }

    this.glContextId = WebGLRenderer.glContextId++;
    gl.id = this.glContextId;
    gl.renderer = this;

    // set up the default pixi settings..
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    this.renderTarget = new RenderTarget(this.gl, this.width, this.height, null, true);
    

    this.emit('context', gl);


    // now resize and we are good to go!
    this.resize(this.width, this.height);
};

/**
 * Renders the object to its webGL view
 *
 * @param object {DisplayObject} the object to be rendered
 */
WebGLRenderer.prototype.render = function (object)
{
    // no point rendering if our context has been blown up!
    if (this.gl.isContextLost())
    {
        return;
    }

    var cacheParent = object.parent;
    object.parent = this._tempDisplayObjectParent;

    // update the scene graph
    object.updateTransform();

    object.parent = cacheParent;

    var gl = this.gl;

    // -- Does this need to be set every frame? -- //
    gl.viewport(0, 0, this.width, this.height);

    // make sure we are bound to the main frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (this.clearBeforeRender)
    {
        if (this.transparent)
        {
            gl.clearColor(0, 0, 0, 0);
        }
        else
        {
            gl.clearColor(this._backgroundColorRgb[0], this._backgroundColorRgb[1], this._backgroundColorRgb[2], 1);
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    this.renderDisplayObject(object, this.renderTarget)//this.projection);
};

/**
 * Renders a Display Object.
 *
 * @param displayObject {DisplayObject} The DisplayObject to render
 * @param projection {Point} The projection
 * @param buffer {Array} a standard WebGL buffer
 */
WebGLRenderer.prototype.renderDisplayObject = function (displayObject, renderTarget)//projection, buffer)
{
    this.blendModeManager.setBlendMode(CONST.blendModes.NORMAL);

    this.currentRenderTarget = renderTarget;

    // reset the render session data..
    this.drawCount = 0;

    // make sure to flip the Y if using a render texture..
//    this.flipY = renderTarget.frameBuffer ? -1 : 1;

    // start the filter manager
    this.filterManager.begin(renderTarget.frameBuffer);

    // render the scene!
    displayObject.renderWebGL(this);

    // finish the sprite batch
    this.currentRenderer.flush();

};

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
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    if (this.autoResize)
    {
        this.view.style.width = this.width / this.resolution + 'px';
        this.view.style.height = this.height / this.resolution + 'px';
    }

    this.gl.viewport(0, 0, this.width, this.height);

    this.renderTarget.resize(width, height);

    this.projection.x =  this.width / 2 / this.resolution;
    this.projection.y =  -this.height / 2 / this.resolution;
};

/**
 * Updates and/or Creates a WebGL texture for the renderer's context.
 *
 * @param texture {BaseTexture|Texture} the texture to update
 */
WebGLRenderer.prototype.updateTexture = function (texture)
{
    texture = texture.baseTexture || texture;

    if (!texture.hasLoaded)
    {
        return;
    }

    var gl = this.gl;

    if (!texture._glTextures[gl.id])
    {
        texture._glTextures[gl.id] = gl.createTexture();
        texture.on('update', this._boundUpdateTexture);
        texture.on('dispose', this._boundDestroyTexture);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);


    if (texture.mipmap && utils.isPowerOfTwo(texture.width, texture.height))
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
    }

    if (!texture._powerOf2)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    return  texture._glTextures[gl.id];
};

WebGLRenderer.prototype.destroyTexture = function (texture)
{
    texture = texture.baseTexture || texture;

    if (!texture.hasLoaded)
    {
        return;
    }

    if (texture._glTextures[this.gl.id])
    {
        this.gl.deleteTexture(texture._glTextures[this.gl.id]);
    }
};

/**
 * Handles a lost webgl context
 *
 * @param event {Event}
 * @private
 */
WebGLRenderer.prototype.handleContextLost = function (event)
{
    event.preventDefault();
};

/**
 * Handles a restored webgl context
 *
 * @param event {Event}
 * @private
 */
WebGLRenderer.prototype.handleContextRestored = function ()
{
    this._initContext();

    // empty all the ol gl textures as they are useless now
    for (var key in utils.TextureCache)
    {
        var texture = utils.TextureCache[key].baseTexture;
        texture._glTextures = [];
    }
};

/**
 * Removes everything from the renderer (event listeners, spritebatch, etc...)
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
WebGLRenderer.prototype.destroy = function (removeView)
{
    if (removeView && this.view.parent)
    {
        this.view.parent.removeChild(this.view);
    }

    // remove listeners
    this.view.removeEventListener('webglcontextlost', this.contextLostBound);
    this.view.removeEventListener('webglcontextrestored', this.contextRestoredBound);

    // time to create the render managers! each one focuses on managine a state in webGL
    this.shaderManager.destroy();
    this.maskManager.destroy();
    this.filterManager.destroy();

    for (var o in this.objectRenderers) {
        this.objectRenderers[o].destroy();
        this.objectRenderers[o] = null;
    }

    this.objectRenderers = null;

    // this.uuid = utils.uuid();
    // this.type = CONST.WEBGL_RENDERER;

    // this.resolution = options.resolution;
    // this.transparent = options.transparent;

    this._backgroundColor = 0x000000;
    this._backgroundColorRgb = null;

    // this.backgroundColor = null;
    // this.autoResize = options.autoResize || false;
    // this.preserveDrawingBuffer = options.preserveDrawingBuffer;
    // this.clearBeforeRender = options.clearBeforeRender;
    // this.width = width || 800;
    // this.height = height || 600;

    this.view = null;

    this.contextLostBound = null;
    this.contextRestoredBound = null;

    this._contextOptions = null;

    this.projection = null;
    this.offset = null;
    this.drawCount = 0;

    this.shaderManager = null;
    this.maskManager = null;
    this.filterManager = null;
    this.blendModeManager = null;

    this.blendModes = null;

    this.gl = null;
    this.blendModes = null;
};

/**
 * Maps Pixi blend modes to WebGL blend modes.
 *
 * @private
 */
WebGLRenderer.prototype._mapBlendModes = function ()
{
    var gl = this.gl;

    if (!this.blendModes)
    {
        this.blendModes = {};

        this.blendModes[CONST.blendModes.NORMAL]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.ADD]           = [gl.SRC_ALPHA, gl.DST_ALPHA];
        this.blendModes[CONST.blendModes.MULTIPLY]      = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.SCREEN]        = [gl.SRC_ALPHA, gl.ONE];
        this.blendModes[CONST.blendModes.OVERLAY]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.DARKEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.LIGHTEN]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.COLOR_DODGE]   = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.COLOR_BURN]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.HARD_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.SOFT_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.DIFFERENCE]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.EXCLUSION]     = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.HUE]           = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.SATURATION]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.COLOR]         = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.blendModes.LUMINOSITY]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    }
};

WebGLRenderer.glContextId = 0;
WebGLRenderer._objectRenderers = {};

WebGLRenderer.registerObjectRenderer = function (name, ctor) {
    WebGLRenderer._objectRenderers[name] = ctor;
};


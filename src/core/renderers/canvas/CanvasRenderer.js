var CanvasMaskManager = require('./utils/CanvasMaskManager'),
    utils = require('../../utils'),
    math = require('../../math'),
    CONST = require('../../const');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @namespace PIXI
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
 */
function CanvasRenderer(width, height, options)
{
    utils.sayHello('Canvas');

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

    /**
     * The renderer type.
     *
     * @member {number}
     */
    this.type = CONST.CANVAS_RENDERER;

    /**
     * The resolution of the canvas.
     *
     * @member {number}
     */
    this.resolution = options.resolution;

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
     * If the scene is transparent Pixi will use clearRect to clear the canvas every frame.
     * Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
     *
     * @member {boolean}
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;

    /**
     * The background color as a number.
     *
     * @member {number}
     * @private
     */
    this._backgroundColor = 0x000000;

    /**
     * The background color as a string.
     *
     * @member {string}
     * @private
     */
    this._backgroundColorString = '#000000';

    this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

    /**
     * Whether the render view is transparent
     *
     * @member {boolean}
     */
    this.transparent = options.transparent;

    /**
     * Whether the render view should be resized automatically
     *
     * @member {boolean}
     */
    this.autoResize = options.autoResize || false;

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

    this.width *= this.resolution;
    this.height *= this.resolution;

    /**
     * The canvas element that everything is drawn to.
     *
     * @member {HTMLCanvasElement}
     */
    this.view = options.view || document.createElement('canvas');

    /**
     * The canvas 2d context that everything is drawn with
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.view.getContext('2d', { alpha: this.transparent });

    /**
     * Boolean flag controlling canvas refresh.
     *
     * @member {boolean}
     */
    this.refresh = true;

    this.view.width = this.width * this.resolution;
    this.view.height = this.height * this.resolution;

    /**
     * Internal var.
     *
     * @member {number}
     */
    this.count = 0;

    /**
     * Instance of a CanvasMaskManager, handles masking when using the canvas renderer
     * @member {CanvasMaskManager}
     */
    this.maskManager = new CanvasMaskManager();

    /**
     * If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Handy for crisp pixel art and speed on legacy devices.
     *
     * @member {boolean}
     */
    this.roundPixels = false;

    this.scaleMode = null;

    this.smoothProperty = null;

    if (this.context.imageSmoothingEnabled)
    {
        this.smoothProperty = 'imageSmoothingEnabled';
    }
    else if (this.context.webkitImageSmoothingEnabled)
    {
        this.smoothProperty = 'webkitImageSmoothingEnabled';
    }
    else if (this.context.mozImageSmoothingEnabled)
    {
        this.smoothProperty = 'mozImageSmoothingEnabled';
    }
    else if (this.context.oImageSmoothingEnabled)
    {
        this.smoothProperty = 'oImageSmoothingEnabled';
    }
    else if (this.context.msImageSmoothingEnabled)
    {
        this.smoothProperty = 'msImageSmoothingEnabled';
    }

    this.currentBlendMode = CONST.blendModes.NORMAL;

    this.blendModes = null;

    this._mapBlendModes();

    /**
     * This temporary display object used as the parent of the currently being rendered item
     * @member DisplayObject
     * @private
     */
    this._tempDisplayObjectParent = {worldTransform:new math.Matrix(), worldAlpha:1};

    this.resize(width, height);
}

// constructor
CanvasRenderer.prototype.constructor = CanvasRenderer;
module.exports = CanvasRenderer;

Object.defineProperties(CanvasRenderer.prototype, {
    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     * @memberof CanvasRenderer#
     */
    backgroundColor: {
        get: function ()
        {
            return this._backgroundColor;
        },
        set: function (val)
        {
            this._backgroundColor = val;
            this._backgroundColorString = utils.hex2string(val);
        }
    }
});

/**
 * Renders the object to this canvas view
 *
 * @param object {DisplayObject} the object to be rendered
 */
CanvasRenderer.prototype.render = function (object)
{
    var cacheParent = object.parent;
    object.parent = this._tempDisplayObjectParent;

    // update the scene graph
    object.updateTransform();

    object.parent = cacheParent;

    this.context.setTransform(1,0,0,1,0,0);

    this.context.globalAlpha = 1;

    this.currentBlendMode = CONST.blendModes.NORMAL;
    this.context.globalCompositeOperation = this.blendModes[CONST.blendModes.NORMAL];

    if (navigator.isCocoonJS && this.view.screencanvas)
    {
        this.context.fillStyle = 'black';
        this.context.clear();
    }

    if (this.clearBeforeRender)
    {
        if (this.transparent)
        {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        else
        {
            this.context.fillStyle = this._backgroundColorString;
            this.context.fillRect(0, 0, this.width , this.height);
        }
    }

    this.renderDisplayObject(object, this.context);
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
CanvasRenderer.prototype.destroy = function (removeView)
{
    if (removeView && this.view.parent)
    {
        this.view.parent.removeChild(this.view);
    }

    this.view = null;
    this.context = null;
    this.maskManager = null;
};

/**
 * Resizes the canvas view to the specified width and height
 *
 * @param width {number} the new width of the canvas view
 * @param height {number} the new height of the canvas view
 */
CanvasRenderer.prototype.resize = function (width, height)
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
};

/**
 * Renders a display object
 *
 * @param displayObject {DisplayObject} The displayObject to render
 * @private
 */
CanvasRenderer.prototype.renderDisplayObject = function (displayObject, context)
{
    var tempContext = this.context;

    this.context = context;
    displayObject.renderCanvas(this);
    this.context = tempContext;
};

/**
 * Maps Pixi blend modes to canvas blend modes.
 *
 * @private
 */
CanvasRenderer.prototype._mapBlendModes = function ()
{
    if (!this.blendModes)
    {
        this.blendModes = {};

        if (utils.canUseNewCanvasBlendModes())
        {
            this.blendModes[CONST.blendModes.NORMAL]        = 'source-over';
            this.blendModes[CONST.blendModes.ADD]           = 'lighter'; //IS THIS OK???
            this.blendModes[CONST.blendModes.MULTIPLY]      = 'multiply';
            this.blendModes[CONST.blendModes.SCREEN]        = 'screen';
            this.blendModes[CONST.blendModes.OVERLAY]       = 'overlay';
            this.blendModes[CONST.blendModes.DARKEN]        = 'darken';
            this.blendModes[CONST.blendModes.LIGHTEN]       = 'lighten';
            this.blendModes[CONST.blendModes.COLOR_DODGE]   = 'color-dodge';
            this.blendModes[CONST.blendModes.COLOR_BURN]    = 'color-burn';
            this.blendModes[CONST.blendModes.HARD_LIGHT]    = 'hard-light';
            this.blendModes[CONST.blendModes.SOFT_LIGHT]    = 'soft-light';
            this.blendModes[CONST.blendModes.DIFFERENCE]    = 'difference';
            this.blendModes[CONST.blendModes.EXCLUSION]     = 'exclusion';
            this.blendModes[CONST.blendModes.HUE]           = 'hue';
            this.blendModes[CONST.blendModes.SATURATION]    = 'saturation';
            this.blendModes[CONST.blendModes.COLOR]         = 'color';
            this.blendModes[CONST.blendModes.LUMINOSITY]    = 'luminosity';
        }
        else
        {
            // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
            this.blendModes[CONST.blendModes.NORMAL]        = 'source-over';
            this.blendModes[CONST.blendModes.ADD]           = 'lighter'; //IS THIS OK???
            this.blendModes[CONST.blendModes.MULTIPLY]      = 'source-over';
            this.blendModes[CONST.blendModes.SCREEN]        = 'source-over';
            this.blendModes[CONST.blendModes.OVERLAY]       = 'source-over';
            this.blendModes[CONST.blendModes.DARKEN]        = 'source-over';
            this.blendModes[CONST.blendModes.LIGHTEN]       = 'source-over';
            this.blendModes[CONST.blendModes.COLOR_DODGE]   = 'source-over';
            this.blendModes[CONST.blendModes.COLOR_BURN]    = 'source-over';
            this.blendModes[CONST.blendModes.HARD_LIGHT]    = 'source-over';
            this.blendModes[CONST.blendModes.SOFT_LIGHT]    = 'source-over';
            this.blendModes[CONST.blendModes.DIFFERENCE]    = 'source-over';
            this.blendModes[CONST.blendModes.EXCLUSION]     = 'source-over';
            this.blendModes[CONST.blendModes.HUE]           = 'source-over';
            this.blendModes[CONST.blendModes.SATURATION]    = 'source-over';
            this.blendModes[CONST.blendModes.COLOR]         = 'source-over';
            this.blendModes[CONST.blendModes.LUMINOSITY]    = 'source-over';
        }
    }
};

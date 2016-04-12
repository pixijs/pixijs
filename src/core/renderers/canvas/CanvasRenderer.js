var SystemRenderer = require('../SystemRenderer'),
    CanvasMaskManager = require('./utils/CanvasMaskManager'),
    CanvasRenderTarget = require('./utils/CanvasRenderTarget'),
    mapCanvasBlendModesToPixi = require('./utils/mapCanvasBlendModesToPixi'),
    utils = require('../../utils'),
    CONST = require('../../const');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function CanvasRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'Canvas', width, height, options);

    this.type = CONST.RENDERER_TYPE.CANVAS;

    /**
     * The canvas 2d context that everything is drawn with.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.rootContext = this.view.getContext('2d', { alpha: this.transparent });
    this.rootResolution = this.resolution;

    /**
     * Boolean flag controlling canvas refresh.
     *
     * @member {boolean}
     */
    this.refresh = true;

    /**
     * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
     *
     * @member {PIXI.CanvasMaskManager}
     */
    this.maskManager = new CanvasMaskManager(this);

    /**
     * The canvas property used to set the canvas smoothing property.
     *
     * @member {string}
     */
    this.smoothProperty = 'imageSmoothingEnabled';

    if (!this.rootContext.imageSmoothingEnabled)
    {
        if (this.rootContext.webkitImageSmoothingEnabled)
        {
            this.smoothProperty = 'webkitImageSmoothingEnabled';
        }
        else if (this.rootContext.mozImageSmoothingEnabled)
        {
            this.smoothProperty = 'mozImageSmoothingEnabled';
        }
        else if (this.rootContext.oImageSmoothingEnabled)
        {
            this.smoothProperty = 'oImageSmoothingEnabled';
        }
        else if (this.rootContext.msImageSmoothingEnabled)
        {
            this.smoothProperty = 'msImageSmoothingEnabled';
        }
    }

    this.initPlugins();

    this.blendModes = mapCanvasBlendModesToPixi();
    this._activeBlendMode = null;

    this.context = null;
    this.renderingToScreen = false;

    this.resize(width, height);
}

// constructor
CanvasRenderer.prototype = Object.create(SystemRenderer.prototype);
CanvasRenderer.prototype.constructor =  CanvasRenderer;
module.exports = CanvasRenderer;
utils.pluginTarget.mixin(CanvasRenderer);


/**
 * Renders the object to this canvas view
 *
 * @param displayObject {PIXI.DisplayObject} The object to be rendered
 * @param [renderTexture] {PIXI.RenderTexture} A render texture to be rendered to. If unset, it will render to the root context.
 * @param [clear=false] {boolean} Whether to clear the canvas before drawing
 * @param [transform] {PIXI.Transform} A transformation to be applied
 * @param [skipUpdateTransform=false] {boolean} Whether to skip the update transform
 */
CanvasRenderer.prototype.render = function (displayObject, renderTexture, clear, transform, skipUpdateTransform)
{

    if (!this.view){
      return;
    }

     // can be handy to know!
    this.renderingToScreen = !renderTexture;

    this.emit('prerender');

    if(renderTexture)
    {
        renderTexture = renderTexture.baseTexture || renderTexture;

        if(!renderTexture._canvasRenderTarget)
        {

            renderTexture._canvasRenderTarget = new CanvasRenderTarget(renderTexture.width, renderTexture.height, renderTexture.resolution);
            renderTexture.source = renderTexture._canvasRenderTarget.canvas;
            renderTexture.valid = true;
        }

        this.context = renderTexture._canvasRenderTarget.context;
        this.resolution = renderTexture._canvasRenderTarget.resolution;
    }
    else
    {

        this.context = this.rootContext;
        this.resolution = this.rootResolution;
    }

    var context = this.context;



    this._lastObjectRendered = displayObject;



    if(!skipUpdateTransform)
    {
        // update the scene graph
        var cacheParent = displayObject.parent;
        var tempWt = this._tempDisplayObjectParent.transform.worldTransform;

        if(transform)
        {
            transform.copy(tempWt);
        }
        else
        {
            tempWt.identity();
        }

        displayObject.parent = this._tempDisplayObjectParent;
        displayObject.updateTransform();
        displayObject.parent = cacheParent;
       // displayObject.hitArea = //TODO add a temp hit area
    }


    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;
    context.globalCompositeOperation = this.blendModes[CONST.BLEND_MODES.NORMAL];

    if (navigator.isCocoonJS && this.view.screencanvas)
    {
        context.fillStyle = 'black';
        context.clear();
    }

    if(clear !== undefined ? clear : this.clearBeforeRender)
    {
        if (this.renderingToScreen) {
            if (this.transparent) {
                context.clearRect(0, 0, this.width, this.height);
            }
            else {
                context.fillStyle = this._backgroundColorString;
                context.fillRect(0, 0, this.width, this.height);
            }
        } //else {
            //TODO: implement background for CanvasRenderTarget or RenderTexture?
        //}
    }

    // TODO RENDER TARGET STUFF HERE..
    var tempContext = this.context;

    this.context = context;
    displayObject.renderCanvas(this);
    this.context = tempContext;

    this.emit('postrender');
};


CanvasRenderer.prototype.setBlendMode = function (blendMode)
{
    if(this._activeBlendMode === blendMode) {
      return;
    }

    this.context.globalCompositeOperation = this.blendModes[blendMode];
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
CanvasRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // call the base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.context = null;

    this.refresh = true;

    this.maskManager.destroy();
    this.maskManager = null;

    this.smoothProperty = null;
};

/**
 * @extends PIXI.SystemRenderer#resize
 *
 * @param {number} w
 * @param {number} h
 */
CanvasRenderer.prototype.resize = function (w, h)
{
    SystemRenderer.prototype.resize.call(this, w, h);

    //reset the scale mode.. oddly this seems to be reset when the canvas is resized.
    //surely a browser bug?? Let pixi fix that for you..
    if(this.smoothProperty)
    {
        this.rootContext[this.smoothProperty] = (CONST.SCALE_MODES.DEFAULT === CONST.SCALE_MODES.LINEAR);
    }

};

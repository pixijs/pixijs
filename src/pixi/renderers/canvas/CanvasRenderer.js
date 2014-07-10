/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * the CanvasRenderer draws the stage and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Dont forget to add the view to your DOM or you will not see anything :)
 *
 * @class CanvasRenderer
 * @constructor
 * @param width=800 {Number} the width of the canvas view
 * @param height=600 {Number} the height of the canvas view
 * @param [view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [transparent=false] {Boolean} the transparency of the render view, default false
 */
PIXI.CanvasRenderer = function(width, height, view, transparent)
{
    if(!PIXI.defaultRenderer)
    {
        PIXI.sayHello("Canvas");
        PIXI.defaultRenderer = this;
    }

    this.type = PIXI.CANVAS_RENDERER;

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the Stage is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
     * If the Stage is transparent Pixi will use clearRect to clear the canvas every frame.
     * Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
     *
     * @property clearBeforeRender
     * @type Boolean
     * @default
     */
    this.clearBeforeRender = true;

    /**
     * Whether the render view is transparent
     *
     * @property transparent
     * @type Boolean
     */
    this.transparent = !!transparent;

    if(!PIXI.blendModesCanvas)
    {
        PIXI.blendModesCanvas = [];

        if(PIXI.canUseNewCanvasBlendModes())
        {
            PIXI.blendModesCanvas[PIXI.blendModes.NORMAL]   = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.ADD]      = "lighter"; //IS THIS OK???
            PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "multiply";
            PIXI.blendModesCanvas[PIXI.blendModes.SCREEN]   = "screen";
            PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY]  = "overlay";
            PIXI.blendModesCanvas[PIXI.blendModes.DARKEN]   = "darken";
            PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN]  = "lighten";
            PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "color-dodge";
            PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "color-burn";
            PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "hard-light";
            PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "soft-light";
            PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "difference";
            PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "exclusion";
            PIXI.blendModesCanvas[PIXI.blendModes.HUE]       = "hue";
            PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "saturation";
            PIXI.blendModesCanvas[PIXI.blendModes.COLOR]      = "color";
            PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "luminosity";
        }
        else
        {
            // this means that the browser does not support the cool new blend modes in canvas "cough" ie "cough"
            PIXI.blendModesCanvas[PIXI.blendModes.NORMAL]   = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.ADD]      = "lighter"; //IS THIS OK???
            PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.SCREEN]   = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY]  = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.DARKEN]   = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN]  = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.HUE]       = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.COLOR]      = "source-over";
            PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "source-over";
        }
    }

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
    this.view = view || document.createElement( "canvas" );

    /**
     * The canvas 2d context that everything is drawn with
     * @property context
     * @type HTMLCanvasElement 2d Context
     */
    this.context = this.view.getContext( "2d", { alpha: this.transparent } );

    this.refresh = true;
    // hack to enable some hardware acceleration!
    //this.view.style["transform"] = "translatez(0)";

    this.view.width = this.width;
    this.view.height = this.height;
    this.count = 0;

    /**
     * Instance of a PIXI.CanvasMaskManager, handles masking when using the canvas renderer
     * @property CanvasMaskManager
     * @type CanvasMaskManager
     */
    this.maskManager = new PIXI.CanvasMaskManager();

    /**
     * The render session is just a bunch of parameter used for rendering
     * @property renderSession
     * @type Object
     */
    this.renderSession = {
        context: this.context,
        maskManager: this.maskManager,
        scaleMode: null,
        smoothProperty: null,

        /**
         * If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Handy for crisp pixel art and speed on legacy devices.
         *
         */
        roundPixels: false
    };

    if("imageSmoothingEnabled" in this.context)
        this.renderSession.smoothProperty = "imageSmoothingEnabled";
    else if("webkitImageSmoothingEnabled" in this.context)
        this.renderSession.smoothProperty = "webkitImageSmoothingEnabled";
    else if("mozImageSmoothingEnabled" in this.context)
        this.renderSession.smoothProperty = "mozImageSmoothingEnabled";
    else if("oImageSmoothingEnabled" in this.context)
        this.renderSession.smoothProperty = "oImageSmoothingEnabled";
};

// constructor
PIXI.CanvasRenderer.prototype.constructor = PIXI.CanvasRenderer;

/**
 * Renders the stage to its canvas view
 *
 * @method render
 * @param stage {Stage} the Stage element to be rendered
 */
PIXI.CanvasRenderer.prototype.render = function(stage)
{
    // update textures if need be
    PIXI.texturesToUpdate.length = 0;
    PIXI.texturesToDestroy.length = 0;

    stage.updateTransform();

    this.context.setTransform(1,0,0,1,0,0);
    this.context.globalAlpha = 1;

    if (navigator.isCocoonJS && this.view.screencanvas) {
        this.context.fillStyle = "black";
        this.context.clear();
    }

    if (!this.transparent && this.clearBeforeRender)
    {
        this.context.fillStyle = stage.backgroundColorString;
        this.context.fillRect(0, 0, this.width, this.height);
    }
    else if (this.transparent && this.clearBeforeRender)
    {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    this.renderDisplayObject(stage);

    // run interaction!
    if(stage.interactive)
    {
        //need to add some events!
        if(!stage._interactiveEventsAdded)
        {
            stage._interactiveEventsAdded = true;
            stage.interactionManager.setTarget(this);
        }
    }

    // remove frame updates..
    if(PIXI.Texture.frameUpdates.length > 0)
    {
        PIXI.Texture.frameUpdates.length = 0;
    }
};

/**
 * Resizes the canvas view to the specified width and height
 *
 * @method resize
 * @param width {Number} the new width of the canvas view
 * @param height {Number} the new height of the canvas view
 */
PIXI.CanvasRenderer.prototype.resize = function(width, height)
{
    this.width = width;
    this.height = height;

    this.view.width = width;
    this.view.height = height;
};

/**
 * Renders a display object
 *
 * @method renderDisplayObject
 * @param displayObject {DisplayObject} The displayObject to render
 * @param context {Context2D} the context 2d method of the canvas
 * @private
 */
PIXI.CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context)
{
    // no longer recursive!
    //var transform;
    //var context = this.context;

    this.renderSession.context = context || this.context;
    displayObject._renderCanvas(this.renderSession);
};

/**
 * Renders a flat strip
 *
 * @method renderStripFlat
 * @param strip {Strip} The Strip to render
 * @private
 */
PIXI.CanvasRenderer.prototype.renderStripFlat = function(strip)
{
    var context = this.context;
    var verticies = strip.verticies;

    var length = verticies.length/2;
    this.count++;

    context.beginPath();
    for (var i=1; i < length-2; i++)
    {
        // draw some triangles!
        var index = i*2;

        var x0 = verticies[index],   x1 = verticies[index+2], x2 = verticies[index+4];
        var y0 = verticies[index+1], y1 = verticies[index+3], y2 = verticies[index+5];

        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
    }

    context.fillStyle = "#FF0000";
    context.fill();
    context.closePath();
};

/**
 * Renders a strip
 *
 * @method renderStrip
 * @param strip {Strip} The Strip to render
 * @private
 */
PIXI.CanvasRenderer.prototype.renderStrip = function(strip)
{
    var context = this.context;

    // draw triangles!!
    var verticies = strip.verticies;
    var uvs = strip.uvs;

    var length = verticies.length/2;
    this.count++;

    for (var i = 1; i < length-2; i++)
    {
        // draw some triangles!
        var index = i*2;

        var x0 = verticies[index],   x1 = verticies[index+2], x2 = verticies[index+4];
        var y0 = verticies[index+1], y1 = verticies[index+3], y2 = verticies[index+5];

        var u0 = uvs[index] * strip.texture.width,   u1 = uvs[index+2] * strip.texture.width, u2 = uvs[index+4]* strip.texture.width;
        var v0 = uvs[index+1]* strip.texture.height, v1 = uvs[index+3] * strip.texture.height, v2 = uvs[index+5]* strip.texture.height;

        context.save();
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.closePath();

        context.clip();

        // Compute matrix transform
        var delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
        var deltaA = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
        var deltaB = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
        var deltaC = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2 - v0*u1*x2 - u0*x1*v2;
        var deltaD = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
        var deltaE = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
        var deltaF = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2 - v0*u1*y2 - u0*y1*v2;

        context.transform(deltaA / delta, deltaD / delta,
                            deltaB / delta, deltaE / delta,
                            deltaC / delta, deltaF / delta);

        context.drawImage(strip.texture.baseTexture.source, 0, 0);
        context.restore();
    }
};

/**
 * Creates a Canvas element of the given size
 *
 * @method CanvasBuffer
 * @param width {Number} the width for the newly created canvas
 * @param height {Number} the height for the newly created canvas
 * @static
 * @private
 */
PIXI.CanvasBuffer = function(width, height)
{
    this.width = width;
    this.height = height;

    this.canvas = document.createElement( "canvas" );
    this.context = this.canvas.getContext( "2d" );

    this.canvas.width = width;
    this.canvas.height = height;
};

/**
 * Clears the canvas that was created by the CanvasBuffer class
 *
 * @method clear
 * @private
 */
PIXI.CanvasBuffer.prototype.clear = function()
{
    this.context.clearRect(0,0, this.width, this.height);
};

/**
 * Resizes the canvas that was created by the CanvasBuffer class to the specified width and height
 *
 * @method resize
 * @param width {Number} the new width of the canvas
 * @param height {Number} the new height of the canvas
 * @private
 */

PIXI.CanvasBuffer.prototype.resize = function(width, height)
{
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
};


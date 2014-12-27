/**
 * The CanvasRenderer draws the Stage and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
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
function CanvasRenderer(width, height, options) {
    if (options) {
        for (var i in defaultRenderOptions) {
            if (typeof options[i] === "undefined") options[i] = defaultRenderOptions[i];
        }
    }
    else {
        options = defaultRenderOptions;
    }

    if (!defaultRenderer) {
        sayHello("Canvas");
        defaultRenderer = this;
    }

    /**
     * The renderer type.
     *
     * @member {number}
     */
    this.type = CANVAS_RENDERER;

    /**
     * The resolution of the canvas.
     *
     * @member {number}
     */
    this.resolution = options.resolution;

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the Stage is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
     * If the Stage is transparent Pixi will use clearRect to clear the canvas every frame.
     * Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
     *
     * @member {boolean}
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;

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
    this.view = options.view || document.createElement( "canvas" );

    /**
     * The canvas 2d context that everything is drawn with
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.view.getContext( "2d", { alpha: this.transparent } );

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
     * The render session is just a bunch of parameter used for rendering
     * @member {object}
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

    this.mapBlendModes();

    this.resize(width, height);

    if (this.context.imageSmoothingEnabled) {
        this.renderSession.smoothProperty = "imageSmoothingEnabled";
    }
    else if (this.context.webkitImageSmoothingEnabled) {
        this.renderSession.smoothProperty = "webkitImageSmoothingEnabled";
    }
    else if (this.context.mozImageSmoothingEnabled) {
        this.renderSession.smoothProperty = "mozImageSmoothingEnabled";
    }
    else if (this.context.oImageSmoothingEnabled) {
        this.renderSession.smoothProperty = "oImageSmoothingEnabled";
    }
    else if (this.context.msImageSmoothingEnabled) {
        this.renderSession.smoothProperty = "msImageSmoothingEnabled";
    }
};

// constructor
CanvasRenderer.prototype.constructor = CanvasRenderer;
module.exports = CanvasRenderer;

/**
 * Renders the Stage to this canvas view
 *
 * @param stage {Stage} the Stage element to be rendered
 */
CanvasRenderer.prototype.render = function (stage) {
    stage.updateTransform();

    this.context.setTransform(1,0,0,1,0,0);

    this.context.globalAlpha = 1;

    this.renderSession.currentBlendMode = blendModes.NORMAL;
    this.context.globalCompositeOperation = blendModesCanvas[blendModes.NORMAL];

    if (navigator.isCocoonJS && this.view.screencanvas) {
        this.context.fillStyle = "black";
        this.context.clear();
    }

    if (this.clearBeforeRender) {
        if (this.transparent) {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        else {
            this.context.fillStyle = stage.backgroundColorString;
            this.context.fillRect(0, 0, this.width , this.height);
        }
    }

    this.renderDisplayObject(stage);

    // run interaction!
    if (stage.interactive) {
        //need to add some events!
        if (!stage._interactiveEventsAdded) {
            stage._interactiveEventsAdded = true;
            stage.interactionManager.setTarget(this);
        }
    }
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=true] {boolean} Removes the Canvas element from the DOM.
 */
CanvasRenderer.prototype.destroy = function (removeView) {
    if (typeof removeView === "undefined") {
        removeView = true;
    }

    if (removeView && this.view.parent) {
        this.view.parent.removeChild(this.view);
    }

    this.view = null;
    this.context = null;
    this.maskManager = null;
    this.renderSession = null;
};

/**
 * Resizes the canvas view to the specified width and height
 *
 * @param width {number} the new width of the canvas view
 * @param height {number} the new height of the canvas view
 */
CanvasRenderer.prototype.resize = function (width, height) {
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    if (this.autoResize) {
        this.view.style.width = this.width / this.resolution + "px";
        this.view.style.height = this.height / this.resolution + "px";
    }
};

/**
 * Renders a display object
 *
 * @param displayObject {DisplayObject} The displayObject to render
 * @param context {CanvasRenderingContext2D} the context 2d method of the canvas
 * @private
 */
CanvasRenderer.prototype.renderDisplayObject = function (displayObject, context) {
    this.renderSession.context = context || this.context;
    this.renderSession.resolution = this.resolution;
    displayObject._renderCanvas(this.renderSession);
};

/**
 * Maps Pixi blend modes to canvas blend modes.
 *
 * @private
 */
CanvasRenderer.prototype.mapBlendModes = function () {
    if (!blendModesCanvas) {
        blendModesCanvas = [];

        if (canUseNewCanvasBlendModes()) {
            blendModesCanvas[blendModes.NORMAL]   = "source-over";
            blendModesCanvas[blendModes.ADD]      = "lighter"; //IS THIS OK???
            blendModesCanvas[blendModes.MULTIPLY] = "multiply";
            blendModesCanvas[blendModes.SCREEN]   = "screen";
            blendModesCanvas[blendModes.OVERLAY]  = "overlay";
            blendModesCanvas[blendModes.DARKEN]   = "darken";
            blendModesCanvas[blendModes.LIGHTEN]  = "lighten";
            blendModesCanvas[blendModes.COLOR_DODGE] = "color-dodge";
            blendModesCanvas[blendModes.COLOR_BURN] = "color-burn";
            blendModesCanvas[blendModes.HARD_LIGHT] = "hard-light";
            blendModesCanvas[blendModes.SOFT_LIGHT] = "soft-light";
            blendModesCanvas[blendModes.DIFFERENCE] = "difference";
            blendModesCanvas[blendModes.EXCLUSION] = "exclusion";
            blendModesCanvas[blendModes.HUE]       = "hue";
            blendModesCanvas[blendModes.SATURATION] = "saturation";
            blendModesCanvas[blendModes.COLOR]      = "color";
            blendModesCanvas[blendModes.LUMINOSITY] = "luminosity";
        }
        else {
            // this means that the browser does not support the cool new blend modes in canvas "cough" ie "cough"
            blendModesCanvas[blendModes.NORMAL]   = "source-over";
            blendModesCanvas[blendModes.ADD]      = "lighter"; //IS THIS OK???
            blendModesCanvas[blendModes.MULTIPLY] = "source-over";
            blendModesCanvas[blendModes.SCREEN]   = "source-over";
            blendModesCanvas[blendModes.OVERLAY]  = "source-over";
            blendModesCanvas[blendModes.DARKEN]   = "source-over";
            blendModesCanvas[blendModes.LIGHTEN]  = "source-over";
            blendModesCanvas[blendModes.COLOR_DODGE] = "source-over";
            blendModesCanvas[blendModes.COLOR_BURN] = "source-over";
            blendModesCanvas[blendModes.HARD_LIGHT] = "source-over";
            blendModesCanvas[blendModes.SOFT_LIGHT] = "source-over";
            blendModesCanvas[blendModes.DIFFERENCE] = "source-over";
            blendModesCanvas[blendModes.EXCLUSION] = "source-over";
            blendModesCanvas[blendModes.HUE]       = "source-over";
            blendModesCanvas[blendModes.SATURATION] = "source-over";
            blendModesCanvas[blendModes.COLOR]      = "source-over";
            blendModesCanvas[blendModes.LUMINOSITY] = "source-over";
        }
    }
};

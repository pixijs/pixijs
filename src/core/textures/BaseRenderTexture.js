var BaseTexture = require('./BaseTexture'),
    Texture = require('./Texture'),
    RenderTarget = require('../renderers/webgl/utils/RenderTarget'),
    FilterManager = require('../renderers/webgl/managers/FilterManager'),
    CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
    math = require('../math'),
    CONST = require('../const'),
    tempMatrix = new math.Matrix(),
    tempRect = new math.Rectangle();

/**
 * A BaseRenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * var renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * var BaserenderTexture = new PIXI.BaseRenderTexture(renderer, 800, 600);
 * var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * BaserenderTexture.render(sprite);
 * ```
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual
 * position a Container should be used:
 *
 * ```js
 * var doc = new PIXI.Container();
 *
 * doc.addChild(sprite);
 *
 * BaserenderTexture.render(doc);  // Renders to center of BaserenderTexture
 * ```
 *
 * @class
 * @extends PIXI.Texture
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used for this BaseRenderTexture
 * @param [width=100] {number} The width of the render texture
 * @param [height=100] {number} The height of the render texture
 * @param [scaleMode] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution of the texture being generated
 */
function BaseRenderTexture(renderer, width, height, scaleMode, resolution)
{
    if (!renderer)
    {
        throw new Error('Unable to create BaseRenderTexture, you must pass a renderer into the constructor.');
    }

    BaseTexture.call(this, null, scaleMode);
   
    this.width = width || 100;
    this.height = height || 100;

    this.resolution = resolution || CONST.RESOLUTION;;
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
    this.hasLoaded = true;

    /**
     * Draw/render the given DisplayObject onto the texture.
     *
     * The displayObject and descendents are transformed during this operation.
     * If `updateTransform` is true then the transformations will be restored before the
     * method returns. Otherwise it is up to the calling code to correctly use or reset
     * the transformed display objects.
     *
     * The display object is always rendered with a worldAlpha value of 1.
     *
     * @method
     * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
     * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
     * @param [clear=false] {boolean} If true the texture will be cleared before the displayObject is drawn
     * @param [updateTransform=true] {boolean} If true the displayObject's worldTransform/worldAlpha and all children
     *  transformations will be restored. Not restoring this information will be a little faster.
     */
    this.render = null;

    /**
     * The renderer this BaseRenderTexture uses. A BaseRenderTexture can only belong to one renderer at the moment if its webGL.
     *
     * @member {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
     */
    this.renderer = renderer;


    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;

        this.textureBuffer = new RenderTarget(gl, this.width, this.height, this.scaleMode, this.resolution);//, this.this.scaleMode);
        this._glTextures[gl.id] =  this.textureBuffer.texture;
        
        //TODO refactor filter manager.. as really its no longer a manager if we use it here..
        this.filterManager = new FilterManager(this.renderer);
        this.filterManager.onContextChange();
        this.filterManager.resize(width, height);
        this.render = this.renderWebGL;

        // the creation of a filter manager unbinds the buffers..
        this.renderer.currentRenderer.start();
        if(this.renderer._activeRenderTarget)this.renderer._activeRenderTarget.activate();
    }
    else
    {

        this.render = this.renderCanvas;
        this.textureBuffer = new CanvasBuffer(this.width* this.resolution, this.height* this.resolution);
        this.source = this.textureBuffer.canvas;
    }

    /**
     * @member {boolean}
     */
    this.valid = true;

}

BaseRenderTexture.prototype = Object.create(BaseTexture.prototype);
BaseRenderTexture.prototype.constructor = BaseRenderTexture;
module.exports = BaseRenderTexture;

/**
 * Resizes the BaseRenderTexture.
 *
 * @param width {number} The width to resize to.
 * @param height {number} The height to resize to.
 * @param updateBase {boolean} Should the baseTexture.width and height values be resized as well?
 */
BaseRenderTexture.prototype.resize = function (width, height)
{
    if (width === this.width && height === this.height)
    {
        return;
    }

    this.valid = (width > 0 && height > 0);

    this.width = width;
    this.height = height;

    if (!this.valid)
    {
        return;
    }

    this.textureBuffer.resize(this.width, this.height);

    if(this.filterManager)
    {
        this.filterManager.resize(this.width, this.height);
    }
};

/**
 * Clears the BaseRenderTexture.
 *
 */
BaseRenderTexture.prototype.clear = function (destinationFrame)
{
    if (!this.valid)
    {
        return;
    }

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    }

    this.textureBuffer.clear(false, destinationFrame);
};

/**
 * Internal method assigned to the `render` property if using a CanvasRenderer.
 *
 * @private
 * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
 * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear=false] {boolean} If true the texture will be cleared before the displayObject is drawn
 * @param [updateTransform=true] {boolean} If true the displayObject's worldTransform/worldAlpha and all children
 *  transformations will be restored. Not restoring this information will be a little faster.
 */
BaseRenderTexture.prototype.renderWebGL = function (frame, displayObject, matrix, clear, updateTransform)
{
    if (!this.valid)
    {
        return;
    }


    updateTransform = (updateTransform !== undefined) ? updateTransform : true;//!updateTransform;

    this.textureBuffer.transform = matrix;

    //TODO not a fan that this is here... it will move!
    this.textureBuffer.activate();

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    if (updateTransform)
    {

        // reset the matrix of the displatyObject..
        displayObject.worldTransform.identity();

        displayObject.currentBounds = null;

        // Time to update all the children of the displayObject with the new matrix..
        var children = displayObject.children;
        var i, j;

        for (i = 0, j = children.length; i < j; ++i)
        {
            children[i].updateTransform();
        }
    }

    tempRect.width = frame.height;
    tempRect.height = frame.width;
   
    //TODO rename textureBuffer to renderTarget..
    var temp =  this.renderer.filterManager;

    this.renderer.filterManager = this.filterManager;
    

    this.textureBuffer.activate(frame, tempRect);
    console.log(displayObject)
    this.renderer.renderDisplayObject(displayObject, this.textureBuffer, clear);

   // console.log("RENDERING ");
    this.renderer.filterManager = temp;
};


/**
 * Internal method assigned to the `render` property if using a CanvasRenderer.
 *
 * @private
 * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
 * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear] {boolean} If true the texture will be cleared before the displayObject is drawn
 */
BaseRenderTexture.prototype.renderCanvas = function (frame, displayObject, matrix, clear, updateTransform)
{
    if (!this.valid)
    {
        return;
    }

    updateTransform = !!updateTransform;

    var wt = tempMatrix;

    wt.identity();

    if (matrix)
    {
        wt.append(matrix);
    }


    wt.tx += frame.x;
    wt.ty += frame.y;

    var cachedWt = displayObject.worldTransform;
    
    displayObject.worldTransform = wt;

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    // Time to update all the children of the displayObject with the new matrix..
    var children = displayObject.children;
    var i, j;

    for (i = 0, j = children.length; i < j; ++i)
    {
        children[i].updateTransform();
    }

    if (clear)
    {
        this.textureBuffer.clear();
    }

    
//    this.textureBuffer.
    var context = this.textureBuffer.context;

    var realResolution = this.renderer.resolution;

    this.renderer.resolution = this.resolution;

    this.renderer.renderDisplayObject(displayObject, context);

    this.renderer.resolution = realResolution;

    if(displayObject.worldTransform === wt)
    {
        // fixes cacheAsBitmap Happening during the above..
        displayObject.worldTransform = cachedWt;
    }

};

/**
 * Destroys this texture
 *
 * @param destroyBase {boolean} Whether to destroy the base texture as well
 */
BaseRenderTexture.prototype.destroy = function ()
{
    Texture.prototype.destroy.call(this, true);

    this.textureBuffer.destroy();

    // destroy the filtermanager..
    if(this.filterManager)
    {
        this.filterManager.destroy();
    }

    this.renderer = null;
};

/**
 * Will return a HTML Image of the texture
 *
 * @return {Image}
 */
BaseRenderTexture.prototype.getImage = function (frame)
{
    var image = new Image();
    image.src = this.getBase64(frame);
    return image;
};

/**
 * Will return a a base64 encoded string of this texture. It works by calling BaseRenderTexture.getCanvas and then running toDataURL on that.
 *
 * @return {string} A base64 encoded string of the texture.
 */
BaseRenderTexture.prototype.getBase64 = function ( frame )
{
    return this.getCanvas(frame).toDataURL();
};

/**
 * Creates a Canvas element, renders this BaseRenderTexture to it and then returns it.
 *
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
BaseRenderTexture.prototype.getCanvas = function ( frame )
{
   

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
         if(!frame)
        {
            frame = tempRect;
            frame.width = this.textureBuffer.size.width;
            frame.height = this.textureBuffer.size.height;
        }

        var width = frame.width * this.resolution;
        var height = frame.height * this.resolution;

        var gl = this.renderer.gl;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(frame.x * this.resolution, frame.y * this.resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var tempCanvas = new CanvasBuffer(width, height);
        var canvasData = tempCanvas.context.getImageData(0, 0, width, height);
        canvasData.data.set(webGLPixels);

        tempCanvas.context.putImageData(canvasData, 0, 0);

        return tempCanvas.canvas;
    }
    else
    {
        if(!frame)
        {
            frame = tempRect;
            frame.width = this.textureBuffer.canvas.width;
            frame.height = this.textureBuffer.canvas.height;
        }

        if(frame.width === this.textureBuffer.canvas.width && 
           frame.height === this.textureBuffer.canvas.height )
        {
            return this.textureBuffer.canvas;
        }
        else
        {

            var resolution = this.resolution;

            var tempCanvas = new CanvasBuffer(frame.width * resolution, frame.height * resolution);
            var canvasData = this.textureBuffer.context.getImageData(frame.x  * resolution, frame.y * resolution, frame.width * resolution, frame.height * resolution);

            tempCanvas.context.putImageData(canvasData, 0, 0);

            return tempCanvas.canvas;
        }
    }
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 *
 * @return {Uint8ClampedArray}
 */
BaseRenderTexture.prototype.getPixels = function ( frame )
{
    if(!frame)
    {
        frame = tempRect;
        frame.width = this.textureBuffer.size.width;
        frame.height = this.textureBuffer.size.height;
    }

    var width = frame.width * this.resolution;
    var height = frame.height * this.resolution;

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(frame.x * this.resolution, frame.y * this.resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return webGLPixels;
    }
    else
    {
        return this.textureBuffer.canvas.getContext('2d').getImageData(frame.x * this.resolution, frame.y * this.resolution, width, height).data;
    }
};

/**
 * Will return a one-dimensional array containing the pixel data of a pixel within the texture in RGBA order, with integer values between 0 and 255 (included).
 *
 * @param x {number} The x coordinate of the pixel to retrieve.
 * @param y {number} The y coordinate of the pixel to retrieve.
 * @return {Uint8ClampedArray}
 */
BaseRenderTexture.prototype.getPixel = function (frame, x, y)
{
    tempRect.x = x;
    tempRect.y = y;
    tempRect.width = 1 / this.resolution;
    tempRect.height = 1 / this.resolution;

    if(frame)
    {
        tempRect.x += frame.x;
        tempRect.y += frame.y;
    }

    return this.getPixels(tempRect);
};

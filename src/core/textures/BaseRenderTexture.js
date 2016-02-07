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
function BaseRenderTexture(width, height, scaleMode, resolution)
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

    this._glRenderTargets = [];

    /**
     * The renderer this BaseRenderTexture uses. A BaseRenderTexture can only belong to one renderer at the moment if its webGL.
     *
     * @member {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

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

    this.emit('update', this);
    
    //TODO - remove this!
    if(this.filterManager)
    {
        this.filterManager.resize(this.width, this.height);
    }
};

/**
 * Destroys this texture
 *
 * @param destroyBase {boolean} Whether to destroy the base texture as well
 */
BaseRenderTexture.prototype.destroy = function ()
{
    BaseTexture.prototype.destroy.call(this, true);

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

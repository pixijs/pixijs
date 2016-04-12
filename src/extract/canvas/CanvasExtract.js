var core = require('../../core'),
    tempRect = new core.Rectangle();

/**
 * The extract manager provides functionality to export content from the renderers
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} A reference to the current renderer
 */
function WebGLExtract(renderer)
{
    this.renderer = renderer;
    renderer.extract = this;
}


WebGLExtract.prototype.constructor = WebGLExtract;
module.exports = WebGLExtract;

/**
 * Will return a HTML Image of the target
 *
 * @return {Image}
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 */
WebGLExtract.prototype.image = function ( target )
{
	var image = new Image();
    image.src = this.base64( target );
    return image;
};

/**
 * Will return a a base64 encoded string of this target. It works by calling WebGLExtract.getCanvas and then running toDataURL on that.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {string} A base64 encoded string of the texture.
 */
WebGLExtract.prototype.base64 = function ( target )
{
    return this.canvas( target ).toDataURL();
};

/**
 * Creates a Canvas element, renders this target to it and then returns it.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
WebGLExtract.prototype.canvas = function ( target )
{
	var renderer = this.renderer;
	var context;
	var resolution;
    var frame;
    var renderTexture;

    if(target)
    {
        if(target instanceof core.RenderTexture)
        {
            renderTexture = target;
        }
        else
        {
            renderTexture = renderer.generateTexture(target);
        }
    }

	if(renderTexture)
    {
        context = renderTexture.baseTexture._canvasRenderTarget.context;
        resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
        frame = renderTexture.frame;
    }
    else
    {
        context = renderer.rootContext;
        resolution = renderer.rootResolution;

        frame = tempRect;
        frame.width = this.renderer.width;
        frame.height = this.renderer.height;
    }

    var width = frame.width * resolution;
    var height = frame.height * resolution;

   	var canvasBuffer = new core.CanvasRenderTarget(width, height);
    var canvasData = context.getImageData(frame.x * resolution, frame.y * resolution, width, height);
    canvasBuffer.context.putImageData(canvasData, 0, 0);


    // send the canvas back..
    return canvasBuffer.canvas;
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 * @param renderTexture {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {Uint8ClampedArray}
 */
WebGLExtract.prototype.pixels = function ( renderTexture )
{
    var renderer = this.renderer;
    var context;
    var resolution;
    var frame;

    if(renderTexture)
    {
        context = renderTexture.baseTexture._canvasRenderTarget.context;
        resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
        frame = renderTexture.frame;
    }
    else
    {
        context = renderer.rootContext;
        resolution = renderer.rootResolution;

        frame = tempRect;
        frame.width = renderer.width;
        frame.height = renderer.height;
    }

    return context.getImageData(0, 0, frame.width * resolution, frame.height * resolution).data;
};

/**
 * Destroys the extract
 *
 */
WebGLExtract.prototype.destroy = function ()
{
    this.renderer.extract = null;
    this.renderer = null;
};

core.CanvasRenderer.registerPlugin('extract', WebGLExtract);

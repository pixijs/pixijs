var core = require('../../core'),
    tempRect = new core.Rectangle();

/**
 * The extract manager provides functionality to export content from the renderers
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer} A reference to the current renderer
 */
function Extract(renderer)
{
    this.renderer = renderer;
    renderer.extract = this;
}


Extract.prototype.constructor = Extract;
module.exports = Extract;

/**
 * Will return a HTML Image of the target
 *
 * @return {Image}
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 */
Extract.prototype.image = function ( target )
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
Extract.prototype.base64 = function ( target )
{
    return this.canvas( target ).toDataURL();
};

/**
 * Creates a Canvas element, renders this target to it and then returns it.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
Extract.prototype.canvas = function ( target )
{
	var renderer = this.renderer;
	var textureBuffer;
	var resolution;
    var frame;
    var flipY = false;
    var renderTexture;

    if(target)
    {
        if(target instanceof core.RenderTexture)
        {
            renderTexture = target;
        }
        else
        {
            renderTexture = this.renderer.generateTexture(target);

        }
    }

	if(renderTexture)
	{
		textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
		resolution = textureBuffer.resolution;
	    frame = renderTexture.frame;
        flipY = false;
    }
	else
	{
		textureBuffer = this.renderer.rootRenderTarget;
		resolution = textureBuffer.resolution;
        flipY = true;

        frame = tempRect;
        frame.width = textureBuffer.size.width;
        frame.height = textureBuffer.size.height;

	}



    var width = frame.width * resolution;
    var height = frame.height * resolution;

   	var canvasBuffer = new core.CanvasRenderTarget(width, height);

    if(textureBuffer)
    {
        // bind the buffer
        renderer.bindRenderTarget(textureBuffer);

        // set up an array of pixels
        var webGLPixels = new Uint8Array(4 * width * height);

        // read pixels to the array
        var gl = renderer.gl;
        gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);

        // add the pixels to the canvas
        var canvasData = canvasBuffer.context.getImageData(0, 0, width, height);
        canvasData.data.set(webGLPixels);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        // pulling pixels
        if(flipY)
        {
            canvasBuffer.context.scale(1, -1);
            canvasBuffer.context.drawImage(canvasBuffer.canvas, 0,-height);
        }
    }

     // send the canvas back..
    return canvasBuffer.canvas;
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 * @param renderTexture {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {Uint8ClampedArray}
 */
Extract.prototype.pixels = function ( renderTexture )
{
    var renderer = this.renderer;
    var textureBuffer;
    var resolution;
    var frame;

    if(renderTexture)
    {
        textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
        resolution = textureBuffer.resolution;
        frame = renderTexture.frame;

    }
    else
    {
        textureBuffer = this.renderer.rootRenderTarget;
        resolution = textureBuffer.resolution;

        frame = tempRect;
        frame.width = textureBuffer.size.width;
        frame.height = textureBuffer.size.height;
    }

    var width = frame.width * resolution;
    var height = frame.height * resolution;

    var webGLPixels = new Uint8Array(4 * width * height);

    if(textureBuffer)
    {
        // bind the buffer
        renderer.bindRenderTarget(textureBuffer);
        // read pixels to the array
        var gl = renderer.gl;
        gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
    }

    return webGLPixels;
};

/**
 * Destroys the extract
 *
 */
Extract.prototype.destroy = function ()
{
    this.renderer.extract = null;
    this.renderer = null;
};

core.WebGLRenderer.registerPlugin('extract', Extract);

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A RenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded otherwise black rectangles will be drawn instead.
 *
 * A RenderTexture takes a snapshot of any Display Object given to its render method. The position and rotation of the given Display Objects is ignored. For example:
 *
 *    var renderTexture = new PIXI.RenderTexture(800, 600);
 *    var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *    sprite.position.x = 800/2;
 *    sprite.position.y = 600/2;
 *    sprite.anchor.x = 0.5;
 *    sprite.anchor.y = 0.5;
 *    renderTexture.render(sprite);
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual position a DisplayObjectContainer should be used:
 *
 *    var doc = new PIXI.DisplayObjectContainer();
 *    doc.addChild(sprite);
 *    renderTexture.render(doc);  // Renders to center of renderTexture
 *
 * @class RenderTexture
 * @extends Texture
 * @constructor
 * @param width {Number} The width of the render texture
 * @param height {Number} The height of the render texture
 * @param renderer {CanvasRenderer|WebGLRenderer} The renderer used for this RenderTexture
 * @param scaleMode {Number} Should be one of the PIXI.scaleMode consts
 * @param resolution {Number} The resolution of the texture being generated
 */
PIXI.RenderTexture = function(width, height, renderer, scaleMode, resolution)
{
    /**
     * The with of the render texture
     *
     * @property width
     * @type Number
     */
    this.width = width || 100;

    /**
     * The height of the render texture
     *
     * @property height
     * @type Number
     */
    this.height = height || 100;

    /**
     * The Resolution of the texture.
     *
     * @property resolution
     * @type Number
     */
    this.resolution = resolution || 1;

    /**
     * The framing rectangle of the render texture
     *
     * @property frame
     * @type Rectangle
     */
    this.frame = new PIXI.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution);

    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     *
     * @property crop
     * @type Rectangle
     */
    this.crop = new PIXI.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution);

    /**
     * The base texture object that this texture uses
     *
     * @property baseTexture
     * @type BaseTexture
     */
    this.baseTexture = new PIXI.BaseTexture();
    this.baseTexture.width = this.width * this.resolution;
    this.baseTexture.height = this.height * this.resolution;
    this.baseTexture._glTextures = [];
    this.baseTexture.resolution = this.resolution;

    this.baseTexture.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;

    this.baseTexture.hasLoaded = true;

    PIXI.Texture.call(this,
        this.baseTexture,
        new PIXI.Rectangle(0, 0, this.width, this.height)
    );

    /**
     * The renderer this RenderTexture uses. A RenderTexture can only belong to one renderer at the moment if its webGL.
     *
     * @property renderer
     * @type CanvasRenderer|WebGLRenderer
     */
    this.renderer = renderer || PIXI.defaultRenderer;

    if(this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        var gl = this.renderer.gl;
        this.baseTexture._dirty[gl.id] = false;

        this.textureBuffer = new PIXI.FilterTexture(gl, this.width * this.resolution, this.height * this.resolution, this.baseTexture.scaleMode);
        this.baseTexture._glTextures[gl.id] =  this.textureBuffer.texture;

        this.render = this.renderWebGL;
        this.projection = new PIXI.Point(this.width*0.5, -this.height*0.5);
    }
    else
    {
        this.render = this.renderCanvas;
        this.textureBuffer = new PIXI.CanvasBuffer(this.width* this.resolution, this.height* this.resolution);
        this.baseTexture.source = this.textureBuffer.canvas;
    }

    /**
     * @property valid
     * @type Boolean
     */
    this.valid = true;

    this._updateUvs();
};

PIXI.RenderTexture.prototype = Object.create(PIXI.Texture.prototype);
PIXI.RenderTexture.prototype.constructor = PIXI.RenderTexture;

/**
 * Resizes the RenderTexture.
 *
 * @method resize
 * @param width {Number} The width to resize to.
 * @param height {Number} The height to resize to.
 * @param updateBase {Boolean} Should the baseTexture.width and height values be resized as well?
 */
PIXI.RenderTexture.prototype.resize = function(width, height, updateBase)
{
    if (width === this.width && height === this.height)return;

    this.valid = (width > 0 && height > 0);

    this.width = this.frame.width = this.crop.width = width;
    this.height =  this.frame.height = this.crop.height = height;

    if (updateBase)
    {
        this.baseTexture.width = this.width;
        this.baseTexture.height = this.height;
    }

    if (this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        this.projection.x = this.width / 2;
        this.projection.y = -this.height / 2;
    }

    if(!this.valid)return;

    this.textureBuffer.resize(this.width * this.resolution, this.height * this.resolution);
};

/**
 * Clears the RenderTexture.
 *
 * @method clear
 */
PIXI.RenderTexture.prototype.clear = function()
{
    if(!this.valid)return;

    if (this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    }

    this.textureBuffer.clear();
};

/**
 * This function will draw the display object to the texture.
 *
 * @method renderWebGL
 * @param displayObject {DisplayObject} The display object to render this texture on
 * @param [matrix] {Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear] {Boolean} If true the texture will be cleared before the displayObject is drawn
 * @private
 */
PIXI.RenderTexture.prototype.renderWebGL = function(displayObject, matrix, clear)
{
    if(!this.valid)return;
    //TOOD replace position with matrix..
   
    //Lets create a nice matrix to apply to our display object. Frame buffers come in upside down so we need to flip the matrix 
    var wt = displayObject.worldTransform;
    wt.identity();
    wt.translate(0, this.projection.y * 2);
    if(matrix)wt.append(matrix);
    wt.scale(1,-1);

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    // Time to update all the children of the displayObject with the new matrix..    
    var children = displayObject.children;

    for(var i=0,j=children.length; i<j; i++)
    {
        children[i].updateTransform();
    }
    
    // time for the webGL fun stuff!
    var gl = this.renderer.gl;

    gl.viewport(0, 0, this.width * this.resolution, this.height * this.resolution);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer );

    if(clear)this.textureBuffer.clear();

    this.renderer.spriteBatch.dirty = true;

    this.renderer.renderDisplayObject(displayObject, this.projection, this.textureBuffer.frameBuffer);

    this.renderer.spriteBatch.dirty = true;
};


/**
 * This function will draw the display object to the texture.
 *
 * @method renderCanvas
 * @param displayObject {DisplayObject} The display object to render this texture on
 * @param [matrix] {Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear] {Boolean} If true the texture will be cleared before the displayObject is drawn
 * @private
 */
PIXI.RenderTexture.prototype.renderCanvas = function(displayObject, matrix, clear)
{
    if(!this.valid)return;

    var wt = displayObject.worldTransform;
    wt.identity();
    if(matrix)wt.append(matrix);

    // Time to update all the children of the displayObject with the new matrix..    
    var children = displayObject.children;

    for(var i = 0, j = children.length; i < j; i++)
    {
        children[i].updateTransform();
    }

    if(clear)this.textureBuffer.clear();

    var context = this.textureBuffer.context;

    var realResolution = this.renderer.resolution;

    this.renderer.resolution = this.resolution;

    this.renderer.renderDisplayObject(displayObject, context);

    this.renderer.resolution = realResolution;
};

/**
 * Will return a HTML Image of the texture
 *
 * @method getImage
 * @return {Image}
 */
PIXI.RenderTexture.prototype.getImage = function()
{
    var image = new Image();
    image.src = this.getBase64();
    return image;
};

/**
 * Will return a a base64 encoded string of this texture. It works by calling RenderTexture.getCanvas and then running toDataURL on that.
 *
 * @method getBase64
 * @return {String} A base64 encoded string of the texture.
 */
PIXI.RenderTexture.prototype.getBase64 = function()
{
    return this.getCanvas().toDataURL();
};

/**
 * Creates a Canvas element, renders this RenderTexture to it and then returns it.
 *
 * @method getCanvas
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
PIXI.RenderTexture.prototype.getCanvas = function()
{
    if (this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        var gl =  this.renderer.gl;
        var width = this.textureBuffer.width;
        var height = this.textureBuffer.height;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var tempCanvas = new PIXI.CanvasBuffer(width, height);
        var canvasData = tempCanvas.context.getImageData(0, 0, width, height);
        var canvasPixels = canvasData.data;

        for (var i = 0; i < webGLPixels.length; i+=4)
        {
            var alpha = webGLPixels[i+3];
            canvasPixels[i] = webGLPixels[i] * alpha;
            canvasPixels[i+1] = webGLPixels[i+1] * alpha;
            canvasPixels[i+2] = webGLPixels[i+2] * alpha;
            canvasPixels[i+3] = alpha;
        }

        tempCanvas.context.putImageData(canvasData, 0, 0);

        return tempCanvas.canvas;
    }
    else
    {
        return this.textureBuffer.canvas;
    }
};

PIXI.RenderTexture.tempMatrix = new PIXI.Matrix();

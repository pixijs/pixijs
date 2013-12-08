/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 A RenderTexture is a special texture that allows any pixi displayObject to be rendered to it.

 __Hint__: All DisplayObjects (exmpl. Sprites) that renders on RenderTexture should be preloaded.
 Otherwise black rectangles will be drawn instead.

 RenderTexture takes snapshot of DisplayObject passed to render method. If DisplayObject is passed to render method, position and rotation of it will be ignored. For example:

    var renderTexture = new PIXI.RenderTexture(800, 600);
    var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
    sprite.position.x = 800/2;
    sprite.position.y = 600/2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    renderTexture.render(sprite);

 Sprite in this case will be rendered to 0,0 position. To render this sprite at center DisplayObjectContainer should be used:

    var doc = new PIXI.DisplayObjectContainer();
    doc.addChild(sprite);
    renderTexture.render(doc);  // Renders to center of renderTexture

 @class RenderTexture
 @extends Texture
 @constructor
 @param width {Number} The width of the render texture
 @param height {Number} The height of the render texture
 */
PIXI.RenderTexture = function(width, height)
{
    PIXI.EventTarget.call( this );

    this.width = width || 100;
    this.height = height || 100;

    this.indetityMatrix = PIXI.mat3.create();

    this.frame = new PIXI.Rectangle(0, 0, this.width, this.height);

    if(PIXI.gl)
    {
        this.initWebGL();
    }
    else
    {
        this.initCanvas();
    }
};

PIXI.RenderTexture.prototype = Object.create( PIXI.Texture.prototype );
PIXI.RenderTexture.prototype.constructor = PIXI.RenderTexture;

/**
 * Initializes the webgl data for this texture
 *
 * @method initWebGL
 * @private
 */
PIXI.RenderTexture.prototype.initWebGL = function()
{
    var gl = PIXI.gl;
    this.glFramebuffer = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFramebuffer );

    this.glFramebuffer.width = this.width;
    this.glFramebuffer.height = this.height;

    this.baseTexture = new PIXI.BaseTexture();

    this.baseTexture.width = this.width;
    this.baseTexture.height = this.height;

    this.baseTexture._glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.baseTexture._glTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  this.width,  this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.baseTexture.isRender = true;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFramebuffer );
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.baseTexture._glTexture, 0);

    // create a projection matrix..
    this.projection = new PIXI.Point(this.width/2 , -this.height/2);

    // set the correct render function..
    this.render = this.renderWebGL;
};


PIXI.RenderTexture.prototype.resize = function(width, height)
{

    this.width = width;
    this.height = height;

    if(PIXI.gl)
    {
        this.projection.x = this.width / 2;
        this.projection.y = -this.height / 2;

        var gl = PIXI.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.baseTexture._glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  this.width,  this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    else
    {

        this.frame.width = this.width;
        this.frame.height = this.height;
        this.renderer.resize(this.width, this.height);
    }
};

/**
 * Initializes the canvas data for this texture
 *
 * @method initCanvas
 * @private
 */
PIXI.RenderTexture.prototype.initCanvas = function()
{
    this.renderer = new PIXI.CanvasRenderer(this.width, this.height, null, 0);

    this.baseTexture = new PIXI.BaseTexture(this.renderer.view);
    this.frame = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.render = this.renderCanvas;
};

/**
 * This function will draw the display object to the texture.
 *
 * @method renderWebGL
 * @param displayObject {DisplayObject} The display object to render this texture on
 * @param clear {Boolean} If true the texture will be cleared before the displayObject is drawn
 * @private
 */
PIXI.RenderTexture.prototype.renderWebGL = function(displayObject, position, clear)
{
    var gl = PIXI.gl;

    // enable the alpha color mask..
    gl.colorMask(true, true, true, true);

    gl.viewport(0, 0, this.width, this.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFramebuffer );

    if(clear)
    {
        gl.clearColor(0,0,0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // THIS WILL MESS WITH HIT TESTING!
    var children = displayObject.children;

    //TODO -? create a new one??? dont think so!
    var originalWorldTransform = displayObject.worldTransform;
    displayObject.worldTransform = PIXI.mat3.create();//sthis.indetityMatrix;
    // modify to flip...
    displayObject.worldTransform[4] = -1;
    displayObject.worldTransform[5] = this.projection.y * -2;

    if(position)
    {
        displayObject.worldTransform[2] = position.x;
        displayObject.worldTransform[5] -= position.y;
    }

    PIXI.visibleCount++;
    displayObject.vcount = PIXI.visibleCount;

    for(var i=0,j=children.length; i<j; i++)
    {
        children[i].updateTransform();
    }

    var renderGroup = displayObject.__renderGroup;

    if(renderGroup)
    {
        if(displayObject === renderGroup.root)
        {
            renderGroup.render(this.projection, this.glFramebuffer);
        }
        else
        {
            renderGroup.renderSpecific(displayObject, this.projection, this.glFramebuffer);
        }
    }
    else
    {
        if(!this.renderGroup)this.renderGroup = new PIXI.WebGLRenderGroup(gl);
        this.renderGroup.setRenderable(displayObject);
        this.renderGroup.render(this.projection, this.glFramebuffer);
    }

    displayObject.worldTransform = originalWorldTransform;
};


/**
 * This function will draw the display object to the texture.
 *
 * @method renderCanvas
 * @param displayObject {DisplayObject} The display object to render this texture on
 * @param clear {Boolean} If true the texture will be cleared before the displayObject is drawn
 * @private
 */
PIXI.RenderTexture.prototype.renderCanvas = function(displayObject, position, clear)
{
    var children = displayObject.children;

    displayObject.worldTransform = PIXI.mat3.create();

    if(position)
    {
        displayObject.worldTransform[2] = position.x;
        displayObject.worldTransform[5] = position.y;
    }


    for(var i = 0, j = children.length; i < j; i++)
    {
        children[i].updateTransform();
    }

    if(clear) this.renderer.context.clearRect(0,0, this.width, this.height);

    this.renderer.renderDisplayObject(displayObject);

    this.renderer.context.setTransform(1,0,0,1,0,0);

    //PIXI.texturesToUpdate.push(this.baseTexture);
};

var math = require('../../../math'),
    utils = require('../../../utils'),
    CONST = require('../../../const'),
        
    GLTexture = require('pixi-gl-core').GLTexture,
    GLFramebuffer = require('pixi-gl-core').GLFramebuffer,
    
    StencilMaskStack = require('./StencilMaskStack');

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @param width {number} the horizontal range of the filter
 * @param height {number} the vertical range of the filter
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param resolution {number} the current resolution
 * @param root {boolean} Whether this object is the root element or not
 */
var RenderTarget = function(gl, width, height, scaleMode, resolution, root)
{
    //TODO Resolution could go here ( eg low res blurs )

    /**
     * The current WebGL drawing context.
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    // next time to create a frame buffer and texture

    /**
     * A frame buffer
     *
     * @member {WebGLFrameBuffer}
     */
    this.frameBuffer = null;

    /**
     * The texture
     *
     * @member {PIXI.Texture}
     */
    this.texture = null;

    this.clearColor = [0, 0, 0, 0];

    /**
     * The size of the object as a rectangle
     *
     * @member {PIXI.Rectangle}
     */
    this.size = new math.Rectangle(0, 0, 1, 1);

    /**
     * The current resolution
     *
     * @member {number}
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * The projection matrix
     *
     * @member {PIXI.Matrix}
     */
    this.projectionMatrix = new math.Matrix();

    /**
     * The object's transform
     *
     * @member {PIXI.Matrix}
     */
    this.transform = null;

    /**
     * The frame.
     *
     * @member {PIXI.Rectangle}
     */
    this.frame = null;

    /**
     * The stencil buffer stores masking data for the render target
     *
     * @member {WebGLRenderBuffer}
     */
    this.stencilBuffer = null;

    /**
     * The data structure for the stencil masks
     *
     * @member {PIXI.StencilMaskStack}
     */
    this.stencilMaskStack = new StencilMaskStack();

    /**
     * Stores filter data for the render target
     *
     * @member {object[]}
     */
    this.filterStack = [
        {
            renderTarget:this,
            filter:[],
            bounds:this.size
        }
    ];


    /**
     * The scale mode.
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.DEFAULT
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Whether this object is the root element or not
     *
     * @member {boolean}
     */
    this.root = root;

    this.frameBuffer = new GLFramebuffer.createRGBA(gl, 100, 100);

    if (!this.root)
    {
        /*
            A frame buffer needs a target to render to..
            create a texture and bind it attach it to the framebuffer..
         */
        
        // create a texture to bind attach to the frameBuffer..
        var texture = new GLTexture(gl);

        texture.enableLinearScaling()
        texture.enableWrapClamp()

        this.frameBuffer.enableTexture(texture);

        // TODO change!
        // this is used by the base texture
        this.texture = texture.texture;
    }
    else
    {
        // make it a null framebuffer..
        this.frameBuffer.framebuffer = null;
    }

    this.resize(width, height);
};

RenderTarget.prototype.constructor = RenderTarget;
module.exports = RenderTarget;

/**
 * Clears the filter texture.
 *
 * @param [bind=false] {boolean} Should we bind our framebuffer before clearing?
 */
RenderTarget.prototype.clear = function(clearColor)
{
    var cc = clearColor || this.clearColor
    this.frameBuffer.clear(cc[0],cc[1],cc[2],cc[3])//r,g,b,a);
};

/**
 * Binds the stencil buffer.
 *
 */
RenderTarget.prototype.attachStencilBuffer = function()
{
    //TODO check if stencil is done?
    /**
     * The stencil buffer is used for masking in pixi
     * lets create one and then add attach it to the framebuffer..
     */
    if (!this.root)
    {
        this.frameBuffer.enableStencil();
    }
};

/**
 * Binds the buffers and initialises the viewport.
 *
 */
RenderTarget.prototype.activate = function()
{
    //TOOD refactor usage of frame..
    var gl = this.gl;

    this.frameBuffer.bind();


    var projectionFrame = this.frame || this.size;

    // TODO add a dirty flag to this of a setter for the frame?
    this.calculateProjection( projectionFrame );

    if(this.transform)
    {
        this.projectionMatrix.append(this.transform);
    }

    gl.viewport(0,0, projectionFrame.width * this.resolution, projectionFrame.height * this.resolution);
};

/**
 * Updates the projection matrix based on a projection frame (which is a rectangle)
 *
 */
RenderTarget.prototype.calculateProjection = function (projectionFrame)
{
    var pm = this.projectionMatrix;

    pm.identity();

    if (!this.root)
    {
        pm.a = 1 / projectionFrame.width*2;
        pm.d = 1 / projectionFrame.height*2;

        pm.tx = -1 - projectionFrame.x * pm.a;
        pm.ty = -1 - projectionFrame.y * pm.d;
    }
    else
    {
        pm.a = 1 / projectionFrame.width*2;
        pm.d = -1 / projectionFrame.height*2;

        pm.tx = -1 - projectionFrame.x * pm.a;
        pm.ty = 1 - projectionFrame.y * pm.d;
    }
};

/**
 * Resizes the texture to the specified width and height
 *
 * @param width {Number} the new width of the texture
 * @param height {Number} the new height of the texture
 */
RenderTarget.prototype.resize = function (width, height)
{
    width = width | 0;
    height = height | 0;

    if (this.size.width === width && this.size.height === height) 
    {
        return;
    }

    this.size.width = width;
    this.size.height = height;

    this.frameBuffer.resize(width * this.resolution, height * this.resolution);
    
    var projectionFrame = this.frame || this.size;

    this.calculateProjection( projectionFrame );
};

/**
 * Destroys the render target.
 *
 */
RenderTarget.prototype.destroy = function ()
{
    var gl = this.gl;
    
    this.frameBuffer.destroy();

    this.frameBuffer = null;
    this.texture = null;
};

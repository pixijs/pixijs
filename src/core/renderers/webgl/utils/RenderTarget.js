var math = require('../../../math'),
    CONST = require('../../../const');

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
* @class FrameBuffer
* @constructor
* @param gl {WebGLContext} the current WebGL drawing context
* @param width {Number} the horizontal range of the filter
* @param height {Number} the vertical range of the filter
* @param scaleMode {Number} See {{#crossLink "PIXI/scaleModes:property"}}PIXI.scaleModes{{/crossLink}} for possible values
*/
var RenderTarget = function(gl, width, height, scaleMode, root)
{
    /**
     * @property gl
     * @type WebGLContext
     */
    this.gl = gl;

    // next time to create a frame buffer and texture

    /**
     * @property frameBuffer
     * @type Any
     */
    this.frameBuffer = null;

    /**
     * @property texture
     * @type Any
     */
    this.texture = null

    this.width = 0;
    this.height = 0;

    this.resolution = 1;

    this.projectionMatrix = new math.Matrix();

    /**
     * @property scaleMode
     * @type Number
     */
    this.scaleMode = scaleMode || CONST.scaleModes.DEFAULT;

    this.root = root;

    if(!this.root)
    {
       // this.flipY = true;
        this.frameBuffer = gl.createFramebuffer();


        /*  
            A frame buffer needs a target to render to..
            create a texture and bind it attach it to the framebuffer..
         */
        
        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D,  this.texture);

        // set the scale properties of the texture..
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer );
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

       

        /*   
            The stencil buffer is used for masking in pixi
            lets create one and then add attach it to the framebuffer..
         */
        this.stencilBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilBuffer);
    }

    this.resize(width, height);
    
};

RenderTarget.prototype.constructor = RenderTarget;
module.exports = RenderTarget;

/**
* Clears the filter texture.
* 
* @method clear
*/
RenderTarget.prototype.clear = function()
{
    var gl = this.gl;
    
    gl.clearColor(0,0,0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

RenderTarget.prototype.activate = function()
{
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer );    
}

/**
 * Resizes the texture to the specified width and height
 *
 * @method resize
 * @param width {Number} the new width of the texture
 * @param height {Number} the new height of the texture
 */
RenderTarget.prototype.resize = function(width, height)
{
    if(this.width === width && this.height === height) return;

    this.width = width;
    this.height = height;

    this.projectionMatrix = new math.Matrix();

    
    if(!this.root)
    {
        var gl = this.gl;

        this.projectionMatrix.a = 1/width*2;
        this.projectionMatrix.d = -1/height*2;

        this.projectionMatrix.tx = -1;
        this.projectionMatrix.ty = 1;

        gl.bindTexture(gl.TEXTURE_2D,  this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  width , height , 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // update the stencil buffer width and height
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width , height );
    }
    else
    {
        this.projectionMatrix.a = 1/width*2;
        this.projectionMatrix.d = -1/height*2;

        this.projectionMatrix.tx = -1;
        this.projectionMatrix.ty = 1;
    }
};

/**
* Destroys the filter texture.
* 
* @method destroy
*/
RenderTarget.prototype.destroy = function()
{
    var gl = this.gl;
    gl.deleteFramebuffer( this.frameBuffer );
    gl.deleteTexture( this.texture );

    this.frameBuffer = null;
    this.texture = null;
};

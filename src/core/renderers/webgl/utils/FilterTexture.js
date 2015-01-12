var CONST = require('../../../const');

/**
 * @class
 * @namespace PIXI
 * @param gl {WebGLContext} the current WebGL drawing context
 * @param width {number} the horizontal range of the filter
 * @param height {number} the vertical range of the filter
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 */
function FilterTexture(gl, width, height, scaleMode)
{
    /**
     * @member {WebGLContext}
     */
    this.gl = gl;

    // next time to create a frame buffer and texture

    /**
     * @member {Any}
     */
    this.frameBuffer = gl.createFramebuffer();

    /**
     * @member {Any}
     */
    this.texture = gl.createTexture();

    /**
     * @member {number}
     */
    scaleMode = scaleMode || CONST.scaleModes.DEFAULT;

    gl.bindTexture(gl.TEXTURE_2D,  this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === CONST.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer );

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer );
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

    // required for masking a mask??
    this.renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);

    // reset render buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.resize(width, height);
}

FilterTexture.prototype.constructor = FilterTexture;
module.exports = FilterTexture;

/**
 * Clears the filter texture.
 *
 */
FilterTexture.prototype.clear = function ()
{
    var gl = this.gl;

    gl.clearColor(0,0,0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

/**
 * Resizes the texture to the specified width and height
 *
 * @param width {number} the new width of the texture
 * @param height {number} the new height of the texture
 */
FilterTexture.prototype.resize = function (width, height)
{
    if (this.width === width && this.height === height)
    {
        return;
    }

    this.width = width;
    this.height = height;

    var gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D,  this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  width , height , 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // update the stencil buffer width and height
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width , height);

    // reset render buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

/**
 * Destroys the filter texture.
 *
 */
FilterTexture.prototype.destroy = function ()
{
    var gl = this.gl;
    gl.deleteFramebuffer( this.frameBuffer );
    gl.deleteTexture( this.texture );

    this.frameBuffer = null;
    this.texture = null;
};

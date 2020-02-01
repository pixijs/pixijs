/**
 * Internal framebuffer for WebGL context
 * @class
 * @memberof PIXI
 */
export class GLFramebuffer
{
    public framebuffer: WebGLFramebuffer;
    public stencil: WebGLRenderbuffer;
    dirtyId: number;
    dirtyFormat: number;
    dirtySize: number;

    constructor(framebuffer: WebGLTexture)
    {
        /**
         * The WebGL framebuffer
         * @member {WebGLFramebuffer}
         */
        this.framebuffer = framebuffer;
        /**
         * stencil+depth , usually costs 32bits per pixel
         * @member {WebGLRenderbuffer}
         */
        this.stencil = null;
        /**
         * latest known version of framebuffer
         * @member {number}
         * @protected
         */
        this.dirtyId = 0;
        /**
         * latest known version of framebuffer format
         * @member {number}
         * @protected
         */
        this.dirtyFormat = 0;
        /**
         * latest known version of framebuffer size
         * @member {number}
         * @protected
         */
        this.dirtySize = 0;
    }
}

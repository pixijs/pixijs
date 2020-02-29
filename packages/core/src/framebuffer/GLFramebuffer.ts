import { Framebuffer } from './Framebuffer';
import { MSAA_QUALITY } from '@pixi/constants';

/**
 * Stores WebGL framebuffer resources attached to a WebGL rendering context.
 *
 * @class
 * @memberof PIXI
 */
export class GLFramebuffer
{
    public framebuffer: WebGLFramebuffer;
    public stencil: WebGLRenderbuffer;
    public multisample: MSAA_QUALITY;
    public msaaBuffer: WebGLRenderbuffer;
    public blitFramebuffer: Framebuffer;
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
         * Latest uploaded version of the framebuffer
         * @member {number}
         * @protected
         */
        this.dirtyId = 0;

        /**
         * Latest uploaded format of the framebuffer
         * @member {number}
         * @protected
         */
        this.dirtyFormat = 0;

        /**
         * Latest uploaded size of the framebuffer
         * @member {number}
         * @protected
         */
        this.dirtySize = 0;

        /**
         * Detected AA samples number
         * @member {PIXI.MSAA_QUALITY}
         */
        this.multisample = MSAA_QUALITY.NONE;

        /**
         * When multisampling is used, this renderbuffer is uploaded instead of the color
         * texture 0.
         * @member {WebGLRenderbuffer}
         */
        this.msaaBuffer = null;

        /**
         * When multisampling is used, this nested framebuffer is used to blit the antialiasing
         * renderbuffer into the color texture 0.
         * @member {PIXI.Framebuffer}
         */
        this.blitFramebuffer = null;
    }
}

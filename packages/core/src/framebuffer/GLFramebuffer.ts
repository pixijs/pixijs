import { MSAA_QUALITY } from '@pixi/constants';

import type { Framebuffer } from './Framebuffer';

/**
 * Internal framebuffer for WebGL context.
 *
 * @memberof PIXI
 */
export class GLFramebuffer
{
    /** The WebGL framebuffer. */
    public framebuffer: WebGLFramebuffer;

    /** Stencil+depth , usually costs 32bits per pixel. */
    public stencil: WebGLRenderbuffer;

    /** Detected AA samples number. */
    public multisample: MSAA_QUALITY;

    /** In case MSAA, we use this Renderbuffer instead of colorTextures[0] when we write info. */
    public msaaBuffer: WebGLRenderbuffer;

    /**
     * In case we use MSAA, this is actual framebuffer that has colorTextures[0]
     * The contents of that framebuffer are read when we use that renderTexture in sprites
     */
    public blitFramebuffer: Framebuffer;

    /** Latest known version of framebuffer. */
    dirtyId: number;

    /** Latest known version of framebuffer format. */
    dirtyFormat: number;

    /** Latest known version of framebuffer size. */
    dirtySize: number;

    /** Store the current mipmap of the textures the framebuffer will write too. */
    mipLevel: number;

    constructor(framebuffer: WebGLTexture)
    {
        this.framebuffer = framebuffer;
        this.stencil = null;
        this.dirtyId = -1;
        this.dirtyFormat = -1;
        this.dirtySize = -1;
        this.multisample = MSAA_QUALITY.NONE;
        this.msaaBuffer = null;
        this.blitFramebuffer = null;
        this.mipLevel = 0;
    }
}

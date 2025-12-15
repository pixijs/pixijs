/**
 * Represents a render target.
 * @category rendering
 * @ignore
 */
export class GlRenderTarget
{
    public width = -1;
    public height = -1;
    public msaa = false;
    /**
     * Tracks which mip level is currently attached to this render target's framebuffer.
     * This lets us skip redundant framebufferTexture2D calls on the common path.
     * @internal
     */
    public _attachedMipLevel = 0;
    /**
     * Tracks which array layer (or cube face index) is currently attached to this render target's framebuffer.
     * For non-array 2D textures this will always be 0.
     * @internal
     */
    public _attachedLayer = 0;
    public framebuffer: WebGLFramebuffer;
    public resolveTargetFramebuffer: WebGLFramebuffer;
    public msaaRenderBuffer: WebGLRenderbuffer[] = [];
    public depthStencilRenderBuffer: WebGLRenderbuffer;
}

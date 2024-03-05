/**
 * Represents a render target.
 * @memberof rendering
 * @ignore
 */
export class GlRenderTarget
{
    public width = -1;
    public height = -1;
    public msaa = false;
    public framebuffer: WebGLFramebuffer;
    public resolveTargetFramebuffer: WebGLFramebuffer;
    public msaaRenderBuffer: WebGLRenderbuffer[] = [];
    public depthStencilRenderBuffer: WebGLRenderbuffer;
}

export class GlRenderTarget
{
    public width = -1;
    public height = -1;

    public framebuffer: WebGLFramebuffer;
    public resolveTargetFramebuffer: WebGLFramebuffer;
    public msaaRenderBuffer: WebGLRenderbuffer[] = [];
    public depthStencilRenderBuffer: WebGLRenderbuffer;

    public msaa = false;
    public dirtyId = -1;
}

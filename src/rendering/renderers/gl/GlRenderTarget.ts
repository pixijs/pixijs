export class GlRenderTarget
{
    width = -1;
    height = -1;

    framebuffer: WebGLFramebuffer;
    resolveTargetFramebuffer: WebGLFramebuffer;
    msaaRenderBuffer: WebGLRenderbuffer[] = [];
    depthStencilRenderBuffer: WebGLRenderbuffer;

    msaa = false;
    dirtyId = -1;
}

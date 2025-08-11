const typeSymbol = Symbol.for('pixijs.GlRenderTarget');

/**
 * Represents a render target.
 * @category rendering
 * @ignore
 */
export class GlRenderTarget
{
    /**
     * Type symbol used to identify instances of GlRenderTarget.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlRenderTarget.
     * @param obj - The object to check.
     * @returns True if the object is a GlRenderTarget, false otherwise.
     */
    public static isGlRenderTarget(obj: any): obj is GlRenderTarget
    {
        return !!obj && !!obj[typeSymbol];
    }

    public width = -1;
    public height = -1;
    public msaa = false;
    public framebuffer: WebGLFramebuffer;
    public resolveTargetFramebuffer: WebGLFramebuffer;
    public msaaRenderBuffer: WebGLRenderbuffer[] = [];
    public depthStencilRenderBuffer: WebGLRenderbuffer;
}

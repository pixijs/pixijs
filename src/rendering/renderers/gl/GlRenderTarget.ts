import { STENCIL_MODES } from '../shared/state/const';

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
    /**
     * The stencil state the stencil system and the mask pipe track for this target on this renderer.
     * It lives here rather than in a uid-keyed record so it is restored when the target is bound again
     * and freed with the backend object when the target dies.
     */
    public stencilMode: STENCIL_MODES = STENCIL_MODES.DISABLED;
    /** the stencil reference value that goes with `stencilMode` */
    public stencilReference = 0;
    /** how many stencil masks are currently pushed on this target */
    public maskStackIndex = 0;
}

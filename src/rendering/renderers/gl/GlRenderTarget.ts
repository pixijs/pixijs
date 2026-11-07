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
    /**
     * Which color attachments the framebuffer's draw buffers currently enable, one bit per
     * attachment. Only tracked for targets with several attachments; `-1` means unknown.
     * @internal
     */
    public _drawBuffersMask = -1;
    public framebuffer: WebGLFramebuffer;
    public resolveTargetFramebuffer: WebGLFramebuffer;
    /**
     * The target's own depth/stencil renderbuffer, for a target with the depth or stencil flag and no
     * depth/stencil texture. Multisampled on an MSAA target.
     */
    public depthStencilRenderBuffer: WebGLRenderbuffer;
    /**
     * Tracks which renderbuffer is currently attached as this MSAA target's depth/stencil, when it has a
     * depth/stencil texture. WebGL textures can't be multisampled, so the texture keeps its samples in its
     * `GlTexture.msaaRenderBuffer` and the target attaches that; it is only re-attached when the texture makes
     * a new one. It belongs to the texture, so the target never deletes it.
     * @internal
     */
    public _attachedDepthStencilRenderBuffer: WebGLRenderbuffer = null;
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

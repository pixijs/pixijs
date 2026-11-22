import { STENCIL_MODES } from '../../shared/state/const';

import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { GpuMsaaTexture } from '../texture/GpuMsaaTexture';

/**
 * A class which holds the canvas contexts and textures for a render target.
 * @category rendering
 * @ignore
 */
export class GpuRenderTarget
{
    public contexts: GPUCanvasContext[] = [];
    /**
     * Per canvas attachment, the canvas texture the last pass drew into. A canvas hands out a new, empty
     * texture each frame, so a different one means nothing has been drawn this frame yet.
     */
    public canvasTextures: GPUTexture[] = [];
    /**
     * Per antialiased canvas attachment, the samples it draws into. A texture's samples are kept with its GPU
     * data (see GpuTextureSystem.getMsaaTexture), but a canvas has none, so its samples stay with the target.
     */
    public canvasMsaaTextures: GpuMsaaTexture[] = [];
    public msaa: boolean;
    /**
     * The user marked this multisampled target `transient` (single pass, never reopened), so its MSAA
     * depth/stencil is discarded too. Read once from the colour texture, like `msaa`. Separate from each
     * colour attachment's samples' `transient`, which is also set on every tile-based GPU.
     */
    public transient = false;
    public msaaSamples = 1;
    public width: number;
    public height: number;
    public descriptor: GPURenderPassDescriptor;
    /**
     * Per MSAA colour attachment, the copy of its resolved image that a reopened pass draws back in (see
     * GpuMsaaRestore), as FilterSystem's `backTexture` is a copy of what a filter draws over. Created on the
     * first restore, then resized with the target and destroyed with it.
     */
    public msaaBackTextures: TextureSource[] = [];
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

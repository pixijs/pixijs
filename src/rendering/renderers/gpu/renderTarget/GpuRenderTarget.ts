import { STENCIL_MODES } from '../../shared/state/const';

import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { GpuMsaaRestoreLayout } from './GpuMsaaRestore';

/**
 * A class which holds the canvas contexts and textures for a render target.
 * @category rendering
 * @ignore
 */
export class GpuRenderTarget
{
    public contexts: GPUCanvasContext[] = [];
    public msaaTextures: TextureSource[] = [];
    public msaa: boolean;
    public msaaSamples = 1;
    public width: number;
    public height: number;
    public descriptor: GPURenderPassDescriptor;
    /**
     * The MSAA colour attachments the last built descriptor opens with `clear` in place of `load`. Their
     * buffers were discarded, so the pass must restore them from the resolved texture before drawing.
     */
    public msaaRestore: number[] = [];
    /** the attachment layout the restore pipelines match, built on the first restore */
    public msaaRestoreLayout: GpuMsaaRestoreLayout = null;
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

import { ExtensionType } from '../../../extensions/Extensions';

import type { RenderTarget } from '../shared/renderTarget/RenderTarget';
import type { STENCIL_MODES } from '../shared/state/const';
import type { System } from '../shared/system/System';
import type { GpuRenderTarget } from './renderTarget/GpuRenderTarget';
import type { WebGPURenderer } from './WebGPURenderer';

/**
 * This manages the stencil buffer. Used primarily for masking
 * @category rendering
 * @advanced
 */
export class GpuStencilSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'stencil',
    } as const;

    private readonly _renderer: WebGPURenderer;

    private _activeRenderTarget: RenderTarget;
    /** the backend counterpart of the active render target, which carries the stencil state being tracked */
    private _activeGpuRenderTarget: GpuRenderTarget;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;

        renderer.renderTarget.onRenderTargetChange.add(this);
    }

    protected contextChange(): void
    {
        // the backend render targets were rebuilt with the device, so the stencil state starts over;
        // the next setStencilMode picks up the rebuilt object, as no change event announces it
        this._activeGpuRenderTarget = null;
    }

    protected onRenderTargetChange(renderTarget: RenderTarget)
    {
        const gpuRenderTarget = this._renderer.renderTarget.getGpuRenderTarget(renderTarget);

        this._activeRenderTarget = renderTarget;
        this._activeGpuRenderTarget = gpuRenderTarget;

        this.setStencilMode(gpuRenderTarget.stencilMode, gpuRenderTarget.stencilReference);
    }

    public setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number)
    {
        const gpuRenderTarget = this._activeGpuRenderTarget
            ??= this._renderer.renderTarget.getGpuRenderTarget(this._activeRenderTarget);

        gpuRenderTarget.stencilMode = stencilMode;
        gpuRenderTarget.stencilReference = stencilReference;

        const renderer = this._renderer;

        renderer.pipeline.setStencilMode(stencilMode);
        renderer.encoder.setStencilReference(stencilReference);
    }

    public destroy()
    {
        this._renderer.renderTarget.onRenderTargetChange.remove(this);

        (this._renderer as null) = null;

        this._activeRenderTarget = null;
        this._activeGpuRenderTarget = null;
    }
}

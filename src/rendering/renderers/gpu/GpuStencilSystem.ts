import { ExtensionType } from '../../../extensions/Extensions';
import { STENCIL_MODES } from '../shared/state/const';

import type { RenderTarget } from '../shared/renderTarget/RenderTarget';
import type { System } from '../shared/system/System';
import type { WebGPURenderer } from './WebGPURenderer';

/**
 * This manages the stencil buffer. Used primarily for masking
 * @memberof rendering
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

    private _renderTargetStencilState: Record<number, {
        stencilMode: STENCIL_MODES;
        stencilReference: number;
    }> = Object.create(null);

    private _activeRenderTarget: RenderTarget;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;

        renderer.renderTarget.onRenderTargetChange.add(this);
    }

    protected onRenderTargetChange(renderTarget: RenderTarget)
    {
        let stencilState = this._renderTargetStencilState[renderTarget.uid];

        if (!stencilState)
        {
            stencilState = this._renderTargetStencilState[renderTarget.uid] = {
                stencilMode: STENCIL_MODES.DISABLED,
                stencilReference: 0,
            };
        }

        this._activeRenderTarget = renderTarget;

        this.setStencilMode(stencilState.stencilMode, stencilState.stencilReference);
    }

    public setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number)
    {
        const stencilState = this._renderTargetStencilState[this._activeRenderTarget.uid];

        stencilState.stencilMode = stencilMode;
        stencilState.stencilReference = stencilReference;

        const renderer = this._renderer;

        renderer.pipeline.setStencilMode(stencilMode);
        renderer.encoder.renderPassEncoder.setStencilReference(stencilReference);
    }

    public destroy()
    {
        this._renderer.renderTarget.onRenderTargetChange.remove(this);

        (this._renderer as null) = null;

        this._activeRenderTarget = null;
        this._renderTargetStencilState = null;
    }
}

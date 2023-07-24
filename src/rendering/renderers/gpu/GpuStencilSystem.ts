import { ExtensionType } from '../../../extensions/Extensions';
import { STENCIL_MODES } from '../shared/state/const';

import type { RenderTarget } from '../shared/renderTarget/RenderTarget';
import type { System } from '../shared/system/System';
import type { WebGPURenderer } from './WebGPURenderer';

export class GpuStencilSystem implements System
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'stencil',
    } as const;

    private readonly renderer: WebGPURenderer;

    private renderTargetStencilState: Record<number, {
        stencilMode: STENCIL_MODES;
        stencilReference: number;
    }> = {};

    private activeRenderTarget: RenderTarget;

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;

        renderer.renderTarget.onRenderTargetChange.add(this);
    }

    onRenderTargetChange(renderTarget: RenderTarget)
    {
        let stencilState = this.renderTargetStencilState[renderTarget.uid];

        if (!stencilState)
        {
            stencilState = this.renderTargetStencilState[renderTarget.uid] = {
                stencilMode: STENCIL_MODES.DISABLED,
                stencilReference: 0,
            };
        }

        this.activeRenderTarget = renderTarget;

        this.setStencilMode(stencilState.stencilMode, stencilState.stencilReference);
    }

    setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number)
    {
        const stencilState = this.renderTargetStencilState[this.activeRenderTarget.uid];

        stencilState.stencilMode = stencilMode;
        stencilState.stencilReference = stencilReference;

        const renderer = this.renderer;

        renderer.pipeline.setStencilMode(stencilMode);
        renderer.encoder.renderPassEncoder.setStencilReference(stencilReference);
    }

    destroy()
    {
        // boom
    }
}

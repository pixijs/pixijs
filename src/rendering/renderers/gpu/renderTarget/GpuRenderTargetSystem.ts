import { ExtensionType } from '../../../../extensions/Extensions';
import { RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import { GpuRenderTargetAdaptor } from './GpuRenderTargetAdaptor';

import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuRenderTarget } from './GpuRenderTarget';

/**
 * The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer
 * @memberof rendering
 */
export class GpuRenderTargetSystem extends RenderTargetSystem<GpuRenderTarget>
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'renderTarget',
    } as const;

    public adaptor = new GpuRenderTargetAdaptor();

    constructor(renderer: WebGPURenderer)
    {
        super(renderer);

        this.adaptor.init(renderer, this);
    }
}

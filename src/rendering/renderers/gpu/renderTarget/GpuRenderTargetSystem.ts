import { RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import { GpuRenderTargetAdaptor } from './GpuRenderTargetAdaptor';

import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuRenderTarget } from './GpuRenderTarget';

/** the WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer */
export class GpuRenderTargetSystem extends RenderTargetSystem<GpuRenderTarget>
{
    public adaptor = new GpuRenderTargetAdaptor();

    constructor(renderer: WebGPURenderer)
    {
        super(renderer);

        this.adaptor.init(renderer, this);
    }
}

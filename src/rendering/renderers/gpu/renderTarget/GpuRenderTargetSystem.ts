import { ExtensionType } from '../../../../extensions/Extensions';
import { RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import { GpuRenderTargetAdaptor } from './GpuRenderTargetAdaptor';

import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuRenderTarget } from './GpuRenderTarget';

const typeSymbol = Symbol.for('pixijs.GpuRenderTargetSystem');

/**
 * The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer
 * @category rendering
 * @advanced
 */
export class GpuRenderTargetSystem extends RenderTargetSystem<GpuRenderTarget>
{
    /**
     * Type symbol used to identify instances of GpuRenderTargetSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuRenderTargetSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GpuRenderTargetSystem, false otherwise.
     */
    public static isGpuRenderTargetSystem(obj: any): obj is GpuRenderTargetSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

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

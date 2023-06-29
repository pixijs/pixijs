import { ExtensionType } from '../../../extensions/Extensions';

import type { ISystem } from '../shared/system/System';
import type { WebGPURenderer } from './WebGPURenderer';

export class GpuColorMaskSystem implements ISystem
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'colorMask',
    } as const;

    private renderer: WebGPURenderer;

    private colorMaskCache = 0b1111;

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;
    }

    setMask(colorMask: number)
    {
        if (this.colorMaskCache === colorMask) return;
        this.colorMaskCache = colorMask;

        this.renderer.pipeline.setColorMask(colorMask);
    }

    destroy()
    {
        // boom!
    }
}

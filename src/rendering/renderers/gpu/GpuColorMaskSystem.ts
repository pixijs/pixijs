import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { WebGPURenderer } from './WebGPURenderer';

export class GpuColorMaskSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'colorMask',
    } as const;

    private readonly _renderer: WebGPURenderer;

    private _colorMaskCache = 0b1111;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    public setMask(colorMask: number)
    {
        if (this._colorMaskCache === colorMask) return;
        this._colorMaskCache = colorMask;

        this._renderer.pipeline.setColorMask(colorMask);
    }

    public destroy()
    {
        // boom!
    }
}

import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { WebGPURenderer } from './WebGPURenderer';

const typeSymbol = Symbol.for('pixijs.GpuColorMaskSystem');

/**
 * The system that handles color masking for the GPU.
 * @category rendering
 * @advanced
 */
export class GpuColorMaskSystem implements System
{
    /**
     * Type symbol used to identify instances of GpuColorMaskSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuColorMaskSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GpuColorMaskSystem, false otherwise.
     */
    public static isGpuColorMaskSystem(obj: any): obj is GpuColorMaskSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

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
        (this._renderer as null) = null;
        this._colorMaskCache = null;
    }
}

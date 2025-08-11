import { ExtensionType } from '../../../extensions/Extensions';
import { type System } from '../shared/system/System';
import { type WebGPURenderer } from './WebGPURenderer';

const typeSymbol = Symbol.for('pixijs.GpuLimitsSystem');

/**
 * The GpuLimitsSystem provides information about the capabilities and limitations of the underlying GPU.
 * These limits, such as the maximum number of textures that can be used in a shader
 * (`maxTextures`) or the maximum number of textures that can be batched together (`maxBatchableTextures`),
 * are determined by the specific graphics hardware and driver.
 *
 * The values for these limits are not available immediately upon instantiation of the class.
 * They are populated when the WebGPU Device rendering context is successfully initialized and ready,
 * which occurs after the `renderer.init()` method has completed.
 * Attempting to access these properties before the context is ready will result in undefined or default values.
 *
 * This system allows the renderer to adapt its behavior and resource allocation strategies
 * to stay within the supported boundaries of the GPU, ensuring optimal performance and stability.
 * @example
 * ```ts
 * const renderer = new WebGPURenderer();
 * await renderer.init(); // GPU limits are populated after this call
 *
 * console.log(renderer.limits.maxTextures);
 * console.log(renderer.limits.maxBatchableTextures);
 * ```
 * @category rendering
 * @advanced
 */
export class GpuLimitsSystem implements System
{
    /**
     * Type symbol used to identify instances of GpuLimitsSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuLimitsSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GpuLimitsSystem, false otherwise.
     */
    public static isGpuLimitsSystem(obj: any): obj is GpuLimitsSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'limits',
    } as const;

    /** The maximum number of textures that can be used by a shader */
    public maxTextures: number;
    /** The maximum number of batchable textures */
    public maxBatchableTextures: number;

    private readonly _renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    public contextChange(): void
    {
        this.maxTextures = this._renderer.device.gpu.device.limits.maxSampledTexturesPerShaderStage;
        this.maxBatchableTextures = this.maxTextures;
    }

    public destroy(): void
    {
        // boom!
    }
}

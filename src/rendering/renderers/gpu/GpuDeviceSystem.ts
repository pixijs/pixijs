import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { GpuPowerPreference } from '../types';
import type { WebGPURenderer } from './WebGPURenderer';

export interface GPU
{
    adapter: GPUAdapter;
    device: GPUDevice;
}

export interface GpuContextOptions
{
    /**
     * An optional hint indicating what configuration of GPU is suitable for the WebGPU context,
     * can be `'high-performance'` or `'low-power'`.
     * Setting to `'high-performance'` will prioritize rendering performance over power consumption,
     * while setting to `'low-power'` will prioritize power saving over rendering performance.
     */
    powerPreference?: GpuPowerPreference;
    /** Force the use of the fallback adapter */
    forceFallbackAdapter: boolean;
}

/**
 * System plugin to the renderer to manage the context.
 * @class
 */
export class GpuDeviceSystem implements System<GpuContextOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'device',
    } as const;

    public static defaultOptions: GpuContextOptions = {
        /**
         * {@link WebGPUOptions.powerPreference}
         * @default default
         */
        powerPreference: undefined,
        /**
         * Force the use of the fallback adapter
         * @default false
         */
        forceFallbackAdapter: false,
    };

    public gpu: GPU;

    private _renderer: WebGPURenderer;
    private _initPromise: Promise<void>;

    /**
     * @param {WebGPURenderer} renderer - The renderer this System works for.
     */
    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    public async init(options: GpuContextOptions): Promise<void>
    {
        if (this._initPromise) return this._initPromise;

        this._initPromise = this._createDeviceAndAdaptor(options)
            .then((gpu) =>
            {
                this.gpu = gpu;

                this._renderer.runners.contextChange.emit(this.gpu);
            });

        return this._initPromise;
    }

    /**
     * Handle the context change event
     * @param gpu
     */
    protected contextChange(gpu: GPU): void
    {
        this._renderer.gpu = gpu;
    }

    /**
     * Helper class to create a WebGL Context
     * @param {object} options - An options object that gets passed in to the canvas element containing the
     *    context attributes
     * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
     * @returns {WebGLRenderingContext} the WebGL context
     */
    private async _createDeviceAndAdaptor(options: GpuContextOptions): Promise<GPU>
    {
        // TODO we only need one of these..
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: options.powerPreference,
            forceFallbackAdapter: options.forceFallbackAdapter,
        });

        const requiredFeatures = [
            'texture-compression-bc',
            'texture-compression-astc',
            'texture-compression-etc2',
        ].filter((feature) => adapter.features.has(feature)) as GPUFeatureName[];

        // TODO and one of these!
        const device = await adapter.requestDevice({
            requiredFeatures
        });

        return { adapter, device };
    }

    public destroy(): void
    {
        this.gpu = null;
        this._renderer = null;
    }
}

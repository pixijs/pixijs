import { DOMAdapter } from '../../../environment/adapter';
import { ExtensionType } from '../../../extensions/Extensions';
import { warn } from '../../../utils/logging/warn';

import type { System } from '../shared/system/System';
import type { GpuPowerPreference } from '../types';
import type { GpuExtensions } from './GpuExtensions';
import type { WebGPURenderer } from './WebGPURenderer';

/**
 * The GPU object.
 * Contains the GPU adapter and device.
 * @category rendering
 * @advanced
 */
export interface GPU
{
    /** The GPU adapter */
    adapter: GPUAdapter;
    /** The GPU device */
    device: GPUDevice;
}

/**
 * Options for the WebGPU context.
 * @property {GpuPowerPreference} [powerPreference=default] - An optional hint indicating what configuration of GPU
 * is suitable for the WebGPU context, can be `'high-performance'` or `'low-power'`.
 * Setting to `'high-performance'` will prioritize rendering performance over power consumption,
 * while setting to `'low-power'` will prioritize power saving over rendering performance.
 * @property {boolean} [forceFallbackAdapter=false] - Force the use of the fallback adapter
 * @category rendering
 * @advanced
 */
export interface GpuContextOptions
{
    /**
     * An optional hint indicating what configuration of GPU is suitable for the WebGPU context,
     * can be `'high-performance'` or `'low-power'`.
     * Setting to `'high-performance'` will prioritize rendering performance over power consumption,
     * while setting to `'low-power'` will prioritize power saving over rendering performance.
     * @default undefined
     */
    powerPreference?: GpuPowerPreference;
    /**
     * Force the use of the fallback adapter
     * @default false
     */
    forceFallbackAdapter: boolean;
    /** Using shared device and adaptor from other engine */
    gpu?: GPU;
}

/**
 * System plugin to the renderer to manage the context.
 * @class
 * @category rendering
 * @advanced
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

    /** The default options for the GpuDeviceSystem. */
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

    /** The GPU device */
    public gpu: GPU;

    /** Optional WebGPU capabilities probed at init. Mirrors `renderer.context.extensions` on the WebGL side. */
    public extensions: GpuExtensions;

    private _renderer: WebGPURenderer;
    private _initPromise: Promise<void>;
    private _options: GpuContextOptions;

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

        this._options = options;
        this._initPromise = (options.gpu ? Promise.resolve(options.gpu) : this._createDeviceAndAdaptor(options))
            .then((gpu) => this._setGpu(gpu));

        return this._initPromise;
    }

    private _setGpu(gpu: GPU): void
    {
        this.gpu = gpu;

        this.extensions = {
            transientAttachment:
                typeof (GPUTextureUsage as { TRANSIENT_ATTACHMENT?: number }).TRANSIENT_ATTACHMENT === 'number',
        };

        // a shared device belongs to the engine that created it, so only restore our own
        if (!this._options.gpu)
        {
            void gpu.device.lost
                .then(() => this._restoreDevice())
                .catch((e) => warn('WebGPU device was lost and could not be restored', e));
        }

        this._renderer.runners.contextChange.emit(this.gpu);
    }

    private async _restoreDevice(): Promise<void>
    {
        // the renderer was destroyed, so there is nothing to restore
        if (!this._renderer) return;

        const gpu = await this._createDeviceAndAdaptor(this._options);

        // destroyed while the new device was being requested
        if (!this._renderer)
        {
            gpu.device.destroy();

            return;
        }

        this._setGpu(gpu);
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
        const adapter = await DOMAdapter.get().getNavigator().gpu.requestAdapter({
            powerPreference: options.powerPreference,
            forceFallbackAdapter: options.forceFallbackAdapter,
        });

        if (!adapter)
        {
            throw new Error('WebGPU not supported. No GPU adapter was returned by navigator.gpu.requestAdapter().');
        }

        const requiredFeatures = [
            'texture-compression-bc',
            'texture-compression-astc',
            'texture-compression-etc2',
            'indirect-first-instance',
        ].filter((feature) => adapter.features.has(feature)) as GPUFeatureName[];

        const device = await adapter.requestDevice({
            requiredFeatures,
            requiredLimits: {
                maxSampledTexturesPerShaderStage: adapter.limits.maxSampledTexturesPerShaderStage,
                maxSamplersPerShaderStage: adapter.limits.maxSamplersPerShaderStage,
            },
        });

        return { adapter, device };
    }

    public destroy(): void
    {
        if (!this._options?.gpu)
        {
            this.gpu?.device.destroy();
        }

        this.gpu = null;
        this.extensions = null;
        this._renderer = null;
    }
}

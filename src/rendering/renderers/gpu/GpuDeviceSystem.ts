import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';
import type { WebGPURenderer } from './WebGPURenderer';

export interface GPU
{
    adapter: GPUAdapter;
    device: GPUDevice;
}

/**
 * System plugin to the renderer to manage the context.
 * @class
 * @extends PIXI.System
 * @memberof PIXI
 */
export class GpuDeviceSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'device',
    } as const;

    public gpu: GPU;

    private _renderer: WebGPURenderer;
    private _initPromise: Promise<void>;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    public async init(): Promise<void>
    {
        if (this._initPromise) return this._initPromise;

        this._initPromise = this._createDeviceAndAdaptor({})
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
    private async _createDeviceAndAdaptor(options: GPURequestAdapterOptions): Promise<GPU>
    {
        // TODO we only need one of these..
        const adapter = await navigator.gpu.requestAdapter(options);
        // TODO and one of these!
        const device = await adapter.requestDevice();

        return { adapter, device };
    }

    public destroy(): void
    {
        this._renderer = null;
    }
}

import { settings } from '../../settings/settings';

/**
 * Helper for checking for WebGPU support.
 * @param options
 * @memberof PIXI.utils
 * @function isWebGPUSupported
 * @returns Is WebGPU supported.
 */
export async function isWebGPUSupported(options: GPURequestAdapterOptions = {}): Promise<boolean>
{
    // try to create get the gpu

    const gpu = settings.ADAPTER.getNavigator().gpu;

    if (!gpu) return false;

    try
    {
        const adapter = await navigator.gpu.requestAdapter(options);
        // TODO and one of these!

        await adapter.requestDevice();

        return true;
    }
    catch (e)
    {
        return false;
    }
}

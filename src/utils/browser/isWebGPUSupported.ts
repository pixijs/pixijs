import { settings } from '../../settings/settings';

let _isWebGPUSupported: boolean;

/**
 * Helper for checking for WebGPU support.
 * @param options
 * @memberof utils
 * @function isWebGPUSupported
 * @returns Is WebGPU supported.
 */
export async function isWebGPUSupported(options: GPURequestAdapterOptions = {}): Promise<boolean>
{
    if (_isWebGPUSupported !== undefined) return _isWebGPUSupported;
    // try to create get the gpu

    _isWebGPUSupported = await (async (): Promise<boolean> =>
    {
        const gpu = settings.ADAPTER.getNavigator().gpu;

        if (!gpu)
        {
            return false;
        }

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
    })();

    return _isWebGPUSupported;
}

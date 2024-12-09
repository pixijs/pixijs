import { DOMAdapter } from '../../environment/adapter';

let _isWebGPUSupported: boolean | undefined;

/**
 * Helper for checking for WebGPU support.
 * @param options - The options for requesting a GPU adapter.
 * @memberof utils
 * @function isWebGPUSupported
 * @returns Is WebGPU supported.
 */
export async function isWebGPUSupported(options: GPURequestAdapterOptions = {}): Promise<boolean>
{
    if (_isWebGPUSupported !== undefined) return _isWebGPUSupported;

    _isWebGPUSupported = await (async (): Promise<boolean> =>
    {
        const gpu = DOMAdapter.get().getNavigator().gpu;

        if (!gpu)
        {
            return false;
        }

        try
        {
            const adapter = await gpu.requestAdapter(options) as GPUAdapter;

            // TODO and one of these!
            await adapter.requestDevice();

            return true;
        }
        catch (_e)
        {
            return false;
        }
    })();

    return _isWebGPUSupported;
}

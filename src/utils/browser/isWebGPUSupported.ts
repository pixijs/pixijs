import { settings } from '../../settings/settings';

/**
 * Helper for checking for WebGPU support.
 * @memberof PIXI.utils
 * @function isWebGPUSupported
 * @returns Is WebGPU supported.
 */
export function isWebGPUSupported()
{
    return !!settings.ADAPTER.getNavigator().gpu;
}

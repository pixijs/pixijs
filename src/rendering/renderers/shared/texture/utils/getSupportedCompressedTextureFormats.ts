import { isWebGLSupported } from '../../../../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../../../../utils/browser/isWebGPUSupported';
import { getSupportedGlCompressedTextureFormats } from '../../../gl/texture/utils/getSupportedGlCompressedTextureFormats';
import { getSupportedGPUCompressedTextureFormats } from '../../../gpu/texture/utils/getSupportedGPUCompressedTextureFormats';

import type { TEXTURE_FORMATS } from '../const';

let supportedCompressedTextureFormats: TEXTURE_FORMATS[];

export async function getSupportedCompressedTextureFormats(): Promise<TEXTURE_FORMATS[]>
{
    if (supportedCompressedTextureFormats !== undefined) return supportedCompressedTextureFormats;

    supportedCompressedTextureFormats = await (async (): Promise<TEXTURE_FORMATS[]> =>
    {
        // find only overlapping ones..
        const _isWebGPUSupported = await isWebGPUSupported();
        const _isWebGLSupported = isWebGLSupported();

        if (_isWebGPUSupported && _isWebGLSupported)
        {
            const gpuTextureFormats = await getSupportedGPUCompressedTextureFormats();
            const glTextureFormats = getSupportedGlCompressedTextureFormats();

            return gpuTextureFormats.filter((format) => glTextureFormats.includes(format));
        }
        else if (_isWebGPUSupported)
        {
            return await getSupportedGPUCompressedTextureFormats();
        }
        else if (_isWebGLSupported)
        {
            return getSupportedGlCompressedTextureFormats();
        }

        return [];
    })();

    return supportedCompressedTextureFormats;
}

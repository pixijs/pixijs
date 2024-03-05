import { glFormatToGPUFormat } from './glFormatToGPUFormat';
import { vkFormatToGPUFormat } from './vkFormatToGPUFormat';

import type { COMPRESSED_TEXTURE_FORMATS, KTXTexture } from '../types';

export function getTextureFormatFromKTXTexture(ktxTexture: KTXTexture): COMPRESSED_TEXTURE_FORMATS
{
    if (ktxTexture.classId === 2)
    {
        return vkFormatToGPUFormat(ktxTexture.vkFormat);
    }

    return glFormatToGPUFormat(ktxTexture.glInternalformat);
}

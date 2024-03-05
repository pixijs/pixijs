import type { COMPRESSED_TEXTURE_FORMATS } from '../types';

const vkFormatToGPUFormatMap: Record<number, COMPRESSED_TEXTURE_FORMATS> = {
    23: 'rgb8unorm', // VK_FORMAT_R8G8B8_UNORM
    37: 'rgba8unorm', // VK_FORMAT_R8G8B8A8_UNORM
    43: 'rgba8unorm-srgb', // VK_FORMAT_R8G8B8A8_SRGB
    // TODO add more!
};

export function vkFormatToGPUFormat(vkFormat: number): COMPRESSED_TEXTURE_FORMATS
{
    const format = vkFormatToGPUFormatMap[vkFormat];

    if (format)
    {
        return format;
    }

    throw new Error(`Unsupported VkFormat: ${vkFormat}`);
}

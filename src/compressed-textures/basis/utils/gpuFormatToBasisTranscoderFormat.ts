const gpuFormatToBasisTranscoderFormatMap: Record<string, number> = {
    'bc3-rgba-unorm': 3, // cTFBC3_RGBA
    'bc7-rgba-unorm': 6, // cTFBC7_RGBA,
    'etc2-rgba8unorm': 1, // cTFETC2_RGBA,
    'astc-4x4-unorm': 10, // cTFASTC_4x4_RGBA,
    // Uncompressed
    rgba8unorm: 13, // cTFRGBA32,
    rgba4unorm: 16, // cTFRGBA4444,
};

export function gpuFormatToBasisTranscoderFormat(transcoderFormat: string): number
{
    const format = gpuFormatToBasisTranscoderFormatMap[transcoderFormat];

    if (format)
    {
        return format;
    }

    throw new Error(`Unsupported transcoderFormat: ${transcoderFormat}`);
}

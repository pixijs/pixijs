const gpuFormatToBasisTranscoderFormatMap: Record<string, string> = {
    'bc3-rgba-unorm': 'BC3_RGBA',
    'bc7-rgba-unorm': 'BC7_M5_RGBA',
    'etc2-rgba8unorm': 'ETC2_RGBA',
    'astc-4x4-unorm': 'ASTC_4x4_RGBA',
    // Uncompressed
    rgba8unorm: 'RGBA32',
    rg11b10ufloat: 'R11F_G11F_B10F',
};

export function gpuFormatToKTXBasisTranscoderFormat(transcoderFormat: string): string
{
    const format = gpuFormatToBasisTranscoderFormatMap[transcoderFormat];

    if (format)
    {
        return format;
    }

    throw new Error(`Unsupported transcoderFormat: ${transcoderFormat}`);
}

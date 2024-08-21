import { DOMAdapter } from '../../../../../environment/adapter';

import type { TEXTURE_FORMATS } from '../../../shared/texture/const';

let supportedGPUCompressedTextureFormats: TEXTURE_FORMATS[];

export async function getSupportedGPUCompressedTextureFormats(): Promise<TEXTURE_FORMATS[]>
{
    if (supportedGPUCompressedTextureFormats) return supportedGPUCompressedTextureFormats;

    const adapter = await DOMAdapter.get().getNavigator().gpu.requestAdapter();

    supportedGPUCompressedTextureFormats = [
        ...adapter.features.has('texture-compression-bc') ? [
            // BC compressed formats usable if "texture-compression-bc" is both
            // supported by the device/user agent and enabled in requestDevice.
            'bc1-rgba-unorm',
            'bc1-rgba-unorm-srgb',
            'bc2-rgba-unorm',
            'bc2-rgba-unorm-srgb',
            'bc3-rgba-unorm',
            'bc3-rgba-unorm-srgb',
            'bc4-r-unorm',
            'bc4-r-snorm',
            'bc5-rg-unorm',
            'bc5-rg-snorm',
            'bc6h-rgb-ufloat',
            'bc6h-rgb-float',
            'bc7-rgba-unorm',
            'bc7-rgba-unorm-srgb',
        ] : [],
        ...adapter.features.has('texture-compression-etc2') ? [
            // ETC2 compressed formats usable if "texture-compression-etc2" is both
            // supported by the device/user agent and enabled in requestDevice.
            'etc2-rgb8unorm',
            'etc2-rgb8unorm-srgb',
            'etc2-rgb8a1unorm',
            'etc2-rgb8a1unorm-srgb',
            'etc2-rgba8unorm',
            'etc2-rgba8unorm-srgb',
            'eac-r11unorm',
            'eac-r11snorm',
            'eac-rg11unorm',
            'eac-rg11snorm',
        ] : [],
        ...adapter.features.has('texture-compression-astc') ? [
            // ASTC compressed formats usable if "texture-compression-astc" is both
            // supported by the device/user agent and enabled in requestDevice.
            'astc-4x4-unorm',
            'astc-4x4-unorm-srgb',
            'astc-5x4-unorm',
            'astc-5x4-unorm-srgb',
            'astc-5x5-unorm',
            'astc-5x5-unorm-srgb',
            'astc-6x5-unorm',
            'astc-6x5-unorm-srgb',
            'astc-6x6-unorm',
            'astc-6x6-unorm-srgb',
            'astc-8x5-unorm',
            'astc-8x5-unorm-srgb',
            'astc-8x6-unorm',
            'astc-8x6-unorm-srgb',
            'astc-8x8-unorm',
            'astc-8x8-unorm-srgb',
            'astc-10x5-unorm',
            'astc-10x5-unorm-srgb',
            'astc-10x6-unorm',
            'astc-10x6-unorm-srgb',
            'astc-10x8-unorm',
            'astc-10x8-unorm-srgb',
            'astc-10x10-unorm',
            'astc-10x10-unorm-srgb',
            'astc-12x10-unorm',
            'astc-12x10-unorm-srgb',
            'astc-12x12-unorm',
            'astc-12x12-unorm-srgb',
        ] : [],
    ] as TEXTURE_FORMATS[];

    return supportedGPUCompressedTextureFormats;
}

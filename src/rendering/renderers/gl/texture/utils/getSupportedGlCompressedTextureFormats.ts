import type { TEXTURE_FORMATS } from '../../../shared/texture/const';

let supportedGLCompressedTextureFormats: TEXTURE_FORMATS[];

export function getSupportedGlCompressedTextureFormats(): TEXTURE_FORMATS[]
{
    if (supportedGLCompressedTextureFormats) return supportedGLCompressedTextureFormats;

    // TODO: can we use already created context (webgl or webgl2)?
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl)
    {
        return [];
    }

    supportedGLCompressedTextureFormats = [
        // BC compressed formats usable if "texture-compression-bc" is both
        // supported by the device/user agent and enabled in requestDevice.
        // 'bc6h-rgb-ufloat'
        // 'bc6h-rgb-float'
        // 'bc7-rgba-unorm',
        // 'bc7-rgba-unorm-srgb',
        ...gl.getExtension('EXT_texture_compression_bptc') ? [
            'bc6h-rgb-ufloat',
            'bc6h-rgb-float',
            'bc7-rgba-unorm',
            'bc7-rgba-unorm-srgb',
        ] : [],
        // BC compressed formats usable if "texture-compression-bc" is both
        // supported by the device/user agent and enabled in requestDevice.
        // 'bc1-rgba-unorm',
        // 'bc1-rgba-unorm-srgb',
        // 'bc4-r-unorm'
        // 'bc4-r-snorm'
        // 'bc5-rg-unorm'
        // 'bc5-rg-snorm'
        ...gl.getExtension('WEBGL_compressed_texture_s3tc') ? [
            'bc1-rgba-unorm',
            'bc2-rgba-unorm',
            'bc3-rgba-unorm',
        ] : [],
        ...gl.getExtension('WEBGL_compressed_texture_s3tc_srgb') ? [
            'bc1-rgba-unorm-srgb',
            'bc2-rgba-unorm-srgb',
            'bc3-rgba-unorm-srgb',
        ] : [],

        ...gl.getExtension('EXT_texture_compression_rgtc') ? [
            'bc4-r-unorm',
            'bc4-r-snorm',
            'bc5-rg-unorm',
            'bc5-rg-snorm',
        ] : [],

        // ETC2 compressed formats usable if "texture-compression-etc2" is both
        // supported by the device/user agent and enabled in requestDevice.
        ...gl.getExtension('WEBGL_compressed_texture_etc') ? [
            'etc2-rgb8unorm',
            'etc2-rgb8unorm-srgb',
            'etc2-rgba8unorm',
            'etc2-rgba8unorm-srgb',
            'etc2-rgb8a1unorm',
            'etc2-rgb8a1unorm-srgb',
            'eac-r11unorm',
            'eac-rg11unorm',
        ] : [],
        // 'eac-r11snorm',
        // 'eac-rg11snorm',
        // ASTC compressed formats usable if "texture-compression-astc" is both
        // supported by the device/user agent and enabled in requestDevice.
        ...gl.getExtension('WEBGL_compressed_texture_astc') ? [
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
            'astc-12x12-unorm-srgb'
        ] : [],
    ] as TEXTURE_FORMATS[];

    return supportedGLCompressedTextureFormats;
}

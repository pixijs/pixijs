import type { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

const compressedFormatMap: Record<string, boolean> = {
    'bc1-rgba-unorm': true,
    'bc1-rgba-unorm-srgb': true,
    'bc2-rgba-unorm': true,
    'bc2-rgba-unorm-srgb': true,
    'bc3-rgba-unorm': true,
    'bc3-rgba-unorm-srgb': true,
    'bc4-r-unorm': true,
    'bc4-r-snorm': true,
    'bc5-rg-unorm': true,
    'bc5-rg-snorm': true,
    'bc6h-rgb-ufloat': true,
    'bc6h-rgb-float': true,
    'bc7-rgba-unorm': true,
    'bc7-rgba-unorm-srgb': true,

    // ETC2 compressed formats usable if "texture-compression-etc2" is both
    // supported by the device/user agent and enabled in requestDevice.
    'etc2-rgb8unorm': true,
    'etc2-rgb8unorm-srgb': true,
    'etc2-rgb8a1unorm': true,
    'etc2-rgb8a1unorm-srgb': true,
    'etc2-rgba8unorm': true,
    'etc2-rgba8unorm-srgb': true,
    'eac-r11unorm': true,
    'eac-r11snorm': true,
    'eac-rg11unorm': true,
    'eac-rg11snorm': true,

    // ASTC compressed formats usable if "texture-compression-astc" is both
    // supported by the device/user agent and enabled in requestDevice.
    'astc-4x4-unorm': true,
    'astc-4x4-unorm-srgb': true,
    'astc-5x4-unorm': true,
    'astc-5x4-unorm-srgb': true,
    'astc-5x5-unorm': true,
    'astc-5x5-unorm-srgb': true,
    'astc-6x5-unorm': true,
    'astc-6x5-unorm-srgb': true,
    'astc-6x6-unorm': true,
    'astc-6x6-unorm-srgb': true,
    'astc-8x5-unorm': true,
    'astc-8x5-unorm-srgb': true,
    'astc-8x6-unorm': true,
    'astc-8x6-unorm-srgb': true,
    'astc-8x8-unorm': true,
    'astc-8x8-unorm-srgb': true,
    'astc-10x5-unorm': true,
    'astc-10x5-unorm-srgb': true,
    'astc-10x6-unorm': true,
    'astc-10x6-unorm-srgb': true,
    'astc-10x8-unorm': true,
    'astc-10x8-unorm-srgb': true,
    'astc-10x10-unorm': true,
    'astc-10x10-unorm-srgb': true,
    'astc-12x10-unorm': true,
    'astc-12x10-unorm-srgb': true,
    'astc-12x12-unorm': true,
    'astc-12x12-unorm-srgb': true,
};

export const glUploadCompressedTextureResource = {

    id: 'compressed',

    upload(source: CompressedSource, glTexture: GlTexture, gl: GlRenderingContext)
    {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

        let mipWidth = source.pixelWidth;
        let mipHeight = source.pixelHeight;

        const compressed = !!compressedFormatMap[source.format];

        for (let i = 0; i < source.resource.length; i++)
        {
            const levelBuffer = source.resource[i];

            if (compressed)
            {
                gl.compressedTexImage2D(
                    gl.TEXTURE_2D, i, glTexture.internalFormat,
                    mipWidth, mipHeight, 0,
                    levelBuffer
                );
            }
            else
            {
                gl.texImage2D(
                    gl.TEXTURE_2D, i, glTexture.internalFormat,
                    mipWidth, mipHeight, 0,
                    glTexture.format, glTexture.type,
                    levelBuffer);
            }

            mipWidth = Math.max(mipWidth >> 1, 1);
            mipHeight = Math.max(mipHeight >> 1, 1);
        }
    }
} as GLTextureUploader;


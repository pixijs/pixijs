import type { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

const compressedFormatMap: Record<string, boolean> = {
    'bc2-rgba-unorm': true,
    'bc3-rgba-unorm': true,
    'bc7-rgba-unorm': true,
    'etc2-rgba8unorm': true,
    'astc-4x4-unorm': true,
    // TODO fill out the rest..
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


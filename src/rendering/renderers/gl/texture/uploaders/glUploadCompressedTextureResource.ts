import { blockDataMap } from '../../../shared/texture/utils/compressedBlockData';

import type { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

/** @internal */
export const glUploadCompressedTextureResource = {

    id: 'compressed',

    upload(
        source: CompressedSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        webGLVersion: number,
        targetOverride?: number,
        _forceAllocation?: boolean
    )
    {
        const target = targetOverride ?? glTexture.target;

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

        let mipWidth = source.pixelWidth;
        let mipHeight = source.pixelHeight;

        const compressed = !!blockDataMap[source.format];
        // WebGL1 rejects mip levels on a texture whose size isn't a power of two
        const levelCount = webGLVersion === 1 && !source.isPowerOfTwo ? 1 : source.resource.length;

        for (let i = 0; i < levelCount; i++)
        {
            const levelBuffer = source.resource[i];

            if (compressed)
            {
                gl.compressedTexImage2D(
                    target, i, glTexture.internalFormat,
                    mipWidth, mipHeight, 0,
                    levelBuffer
                );
            }
            else
            {
                gl.texImage2D(
                    target, i, glTexture.internalFormat,
                    mipWidth, mipHeight, 0,
                    glTexture.format, glTexture.type,
                    levelBuffer);
            }

            mipWidth = Math.max(mipWidth >> 1, 1);
            mipHeight = Math.max(mipHeight >> 1, 1);
        }
    }
} as GLTextureUploader;


import { blockDataMap } from '../../../shared/texture/utils/compressedBlockData';
import { GL_TYPES } from '../const';
import { bgraToRgba, isBgraFormat } from '../utils/bgraToRgba';

import type { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

/**
 * texImage2D rejects pixels whose typed array doesn't match the pixel type, so these types upload through a view.
 * WebGL2's HALF_FLOAT is 0x140B; GL_TYPES.HALF_FLOAT is WebGL1's HALF_FLOAT_OES.
 */
const glTypeArrays: Record<number, Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor> = {
    0x140B: Uint16Array,
    [GL_TYPES.FLOAT]: Float32Array,
    [GL_TYPES.UNSIGNED_INT_2_10_10_10_REV]: Uint32Array,
};

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

        // uncompressed levels are tightly packed rows; compressed uploads ignore the setting
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        let mipWidth = source.pixelWidth;
        let mipHeight = source.pixelHeight;

        const compressed = !!blockDataMap[source.format];
        // WebGL1 rejects mip levels on a texture whose size isn't a power of two
        const levelCount = webGLVersion === 1 && !source.isPowerOfTwo ? 1 : source.resource.length;
        const ArrayType = glTypeArrays[glTexture.type];
        const bgra = isBgraFormat(source.format);

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
                const typedLevel = ArrayType
                    ? new ArrayType(
                        levelBuffer.buffer as ArrayBuffer,
                        levelBuffer.byteOffset,
                        levelBuffer.byteLength / ArrayType.BYTES_PER_ELEMENT
                    )
                    : levelBuffer;

                gl.texImage2D(
                    target, i, glTexture.internalFormat,
                    mipWidth, mipHeight, 0,
                    glTexture.format, glTexture.type,
                    bgra ? bgraToRgba(levelBuffer) : typedLevel);
            }

            mipWidth = Math.max(mipWidth >> 1, 1);
            mipHeight = Math.max(mipHeight >> 1, 1);
        }

        // later uploads expect WebGL's default
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }
} as GLTextureUploader;


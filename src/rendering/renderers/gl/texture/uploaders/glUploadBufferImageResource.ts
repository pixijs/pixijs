import { Rectangle } from '../../../../../maths/shapes/Rectangle';
import { TEXTURE_FORMAT_BYTES_PER_PIXEL } from '../../../shared/texture/const';
import { getTexelRangeRects } from '../../../shared/texture/utils/getTexelRangeRects';
import { GL_TARGETS } from '../const';
import { bgraToRgba, isBgraFormat, MAX_SHARED_SWAP_BYTES } from '../utils/bgraToRgba';

import type { TypedArray } from '../../../shared/buffer/Buffer';
import type { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

const tempRects = [new Rectangle(), new Rectangle(), new Rectangle()];

// the bytes WebGL reads for `rows` rows of `rowBytes`, with every row but the last padded to `alignment`
function paddedRowsByteLength(rows: number, rowBytes: number, alignment: number): number
{
    return ((rows - 1) * (Math.ceil(rowBytes / alignment) * alignment)) + rowBytes;
}

/**
 * Swaps the BGRA texels of an update to an allocated texture. Texels too big for the shared swap buffer go into one
 * the texture keeps, sized to the whole resource so every later update or rect fits. Allocation uploads don't come
 * here, so a texture uploaded once keeps no copy.
 * @param glTexture - the texture being updated
 * @param resource - the source's texels
 * @param texels - the part of `resource` to upload
 */
function bgraUpdateToRgba(glTexture: GlTexture, resource: TypedArray, texels: TypedArray = resource): Uint8Array
{
    const kept = glTexture._bgraScratch;

    if (texels.byteLength > MAX_SHARED_SWAP_BYTES && (!kept || kept.byteLength < texels.byteLength))
    {
        glTexture._bgraScratch = new ArrayBuffer(resource.byteLength);
    }

    return bgraToRgba(texels, glTexture._bgraScratch);
}

/** @internal */
export const glUploadBufferImageResource = {

    id: 'buffer',

    upload(
        source: BufferImageSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        _webGLVersion: number,
        targetOverride?: number,
        forceAllocation = false
    )
    {
        const target = targetOverride || glTexture.target;
        const resource = source.resource as TypedArray;
        // WebGL has no BGRA upload format, so BGRA texels upload as a copy with red and blue swapped
        const bgra = isBgraFormat(source.format);

        // WebGL reads rows padded to UNPACK_ALIGNMENT, 4 by default. A buffer long enough for padded rows uploads as it
        // always has. One too short for them holds tightly packed rows, which upload at an alignment of 1.
        const bytesPerPixel = TEXTURE_FORMAT_BYTES_PER_PIXEL[source.format];
        const rowBytes = source.width * bytesPerPixel;
        const rows = source.height * source.depthOrArrayLayers;
        const tightRows = bytesPerPixel !== undefined && resource.byteLength < paddedRowsByteLength(rows, rowBytes, 4);
        // the alignment to put back afterwards; 1 means there's nothing to change
        let alignment: number = tightRows ? gl.getParameter(gl.UNPACK_ALIGNMENT) : 1;

        // a host alignment below 4 can fit rows too short for 4, and then they upload as they always have
        if (alignment !== 1 && resource.byteLength >= paddedRowsByteLength(rows, rowBytes, alignment)) alignment = 1;

        if (alignment !== 1) gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        // a 3D texture or 2D array uploads as one box; BufferImageSource.update rejects partial ranges for these
        if (target === GL_TARGETS.TEXTURE_3D || target === GL_TARGETS.TEXTURE_2D_ARRAY)
        {
            if (forceAllocation || glTexture.width !== source.width || glTexture.height !== source.height)
            {
                gl.texImage3D(
                    target,
                    0,
                    glTexture.internalFormat,
                    source.width,
                    source.height,
                    source.depthOrArrayLayers,
                    0,
                    glTexture.format,
                    glTexture.type,
                    bgra ? bgraToRgba(resource) : resource
                );
            }
            else
            {
                gl.texSubImage3D(
                    target,
                    0,
                    0,
                    0,
                    0,
                    source.width,
                    source.height,
                    source.depthOrArrayLayers,
                    glTexture.format,
                    glTexture.type,
                    bgra ? bgraUpdateToRgba(glTexture, resource) : resource
                );
            }
        }
        else
        {
            const texelCount = source.width * source.height;
            const needsAllocation = forceAllocation
                || glTexture.width !== source.width
                || glTexture.height !== source.height;
            const isPartial = source._updateStart > 0 || source._updateEnd < texelCount;

            if (needsAllocation)
            {
                gl.texImage2D(
                    target,
                    0,
                    glTexture.internalFormat,
                    source.width,
                    source.height,
                    0,
                    glTexture.format,
                    glTexture.type,
                    bgra ? bgraToRgba(resource) : resource
                );
            }
            else if (isPartial)
            {
                const elementsPerTexel = resource.length / texelCount;

                const count = getTexelRangeRects(
                    source._updateStart,
                    source._updateEnd,
                    source.width,
                    source.height,
                    tempRects
                );

                // each rect is contiguous in the buffer, so texSubImage2D can read it from a subarray
                for (let i = 0; i < count; i++)
                {
                    const rect = tempRects[i];
                    const offset = ((rect.y * source.width) + rect.x) * elementsPerTexel;
                    const texels = resource.subarray(offset, offset + (rect.width * rect.height * elementsPerTexel));

                    gl.texSubImage2D(
                        target,
                        0,
                        rect.x,
                        rect.y,
                        rect.width,
                        rect.height,
                        glTexture.format,
                        glTexture.type,
                        bgra ? bgraUpdateToRgba(glTexture, resource, texels) : texels
                    );
                }
            }
            else
            {
                gl.texSubImage2D(
                    target,
                    0,
                    0,
                    0,
                    source.width,
                    source.height,
                    glTexture.format,
                    glTexture.type,
                    bgra ? bgraUpdateToRgba(glTexture, resource) : resource
                );
            }
        }

        glTexture.width = source.width;
        glTexture.height = source.height;

        if (alignment !== 1) gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
    }
} as GLTextureUploader;

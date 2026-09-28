import { Rectangle } from '../../../../../maths/shapes/Rectangle';
import { getTexelRangeRects } from '../../../shared/texture/utils/getTexelRangeRects';

import type { TypedArray } from '../../../shared/buffer/Buffer';
import type { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

const tempRects = [new Rectangle(), new Rectangle(), new Rectangle()];

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

        const texelCount = source.width * source.height;
        const needsAllocation = forceAllocation || glTexture.width !== source.width || glTexture.height !== source.height;
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
                resource
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

                gl.texSubImage2D(
                    target,
                    0,
                    rect.x,
                    rect.y,
                    rect.width,
                    rect.height,
                    glTexture.format,
                    glTexture.type,
                    resource.subarray(offset, offset + (rect.width * rect.height * elementsPerTexel))
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
                resource
            );
        }

        glTexture.width = source.width;
        glTexture.height = source.height;
    }
} as GLTextureUploader;

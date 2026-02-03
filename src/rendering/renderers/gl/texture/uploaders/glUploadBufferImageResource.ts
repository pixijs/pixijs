import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

/** @internal */
export const glUploadBufferImageResource = {

    id: 'buffer',

    upload(
        source: TextureSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        _webGLVersion: number,
        targetOverride?: number,
        forceAllocation = false
    )
    {
        const target = targetOverride || glTexture.target;

        if (!forceAllocation && (glTexture.width === source.width && glTexture.height === source.height))
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
                source.resource
            );
        }
        else
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
                source.resource
            );
        }

        glTexture.width = source.width;
        glTexture.height = source.height;
    }
} as GLTextureUploader;


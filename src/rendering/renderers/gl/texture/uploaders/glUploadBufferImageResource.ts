import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

export const glUploadBufferImageResource = {

    id: 'buffer',

    upload(source: TextureSource, glTexture: GlTexture, gl: GlRenderingContext)
    {
        if (glTexture.width === source.width || glTexture.height === source.height)
        {
            gl.texSubImage2D(
                gl.TEXTURE_2D,
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
                glTexture.target,
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


import type { CanvasSource } from '../../../shared/texture/sources/CanvasSource';
import type { ImageSource } from '../../../shared/texture/sources/ImageSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

export const glUploadImageResource = {

    type: 'image',

    upload(source: ImageSource | CanvasSource, glTexture: GlTexture, gl: GlRenderingContext)
    {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !(source.alphaMode === 0));

        if (glTexture.width === source.width || glTexture.height === source.height)
        {
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                0,
                0,
                glTexture.format,
                glTexture.type,
                source.resource as TexImageSource
            );
        }
        else
        {
            gl.texImage2D(
                glTexture.target,
                0,
                glTexture.internalFormat,
                source.pixelWidth,
                source.pixelHeight,
                0,
                glTexture.format,
                glTexture.type,
                source.resource as TexImageSource
            );
        }

        glTexture.width = source.pixelWidth;
        glTexture.height = source.pixelHeight;
    }
} as GLTextureUploader;


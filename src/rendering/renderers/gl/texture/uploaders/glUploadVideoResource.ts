import { glUploadImageResource } from './glUploadImageResource';

import type { VideoSource } from '../../../shared/texture/sources/VideoSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

export const glUploadVideoResource = {

    id: 'video',

    upload(source: VideoSource, glTexture: GlTexture, gl: GlRenderingContext, webGLVersion: number)
    {
        if (!source.isValid)
        {
            gl.texImage2D(
                glTexture.target,
                0,
                glTexture.internalFormat,
                1,
                1,
                0,
                glTexture.format,
                glTexture.type,
                null
            );

            return;
        }

        glUploadImageResource.upload(source, glTexture, gl, webGLVersion);
    }
} as GLTextureUploader;


import { glUploadImageResource } from './glUploadImageResource';

import type { VideoSource } from '../../../shared/texture/sources/VideoSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

/** @internal */
export const glUploadVideoResource = {

    id: 'video',

    upload(
        source: VideoSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        webGLVersion: number,
        targetOverride?: number,
        forceAllocation?: boolean
    )
    {
        if (!source.isValid)
        {
            const target = targetOverride ?? glTexture.target;

            gl.texImage2D(
                target,
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

        glUploadImageResource.upload(source as any, glTexture, gl, webGLVersion, targetOverride, forceAllocation);
    }
} as GLTextureUploader;


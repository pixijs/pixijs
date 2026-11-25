import { isSafari } from '../../../../../utils/browser/isSafari';
import { glUploadImageResource } from './glUploadImageResource';

import type { VideoSource } from '../../../shared/texture/sources/VideoSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

// In Safari, texImage2D is significantly faster than texSubImage2D for video sources
// (see https://github.com/pixijs/pixijs/pull/10383).
// Resolved on first upload rather than at module load, so importing pixi.js doesn't read the
// navigator before a custom DOMAdapter has been set.
let defaultForceAllocation: boolean | undefined;

function getDefaultForceAllocation(): boolean
{
    defaultForceAllocation ??= isSafari();

    return defaultForceAllocation;
}

/** @internal */
export const glUploadVideoResource = {

    id: 'video',

    upload(
        source: VideoSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        webGLVersion: number,
        targetOverride?: number,
        forceAllocation = getDefaultForceAllocation()
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


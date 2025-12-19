import { GL_TARGETS } from '../const';

import type { CubeTextureSource } from '../../../shared/texture/sources/CubeTextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

const FACE_ORDER: (keyof CubeTextureSource['faces'])[] = ['right', 'left', 'top', 'bottom', 'front', 'back'];

/**
 * Creates a cube uploader that delegates to the given uploader registry.
 * This keeps the uploader map owned by the texture system (better discoverability),
 * while allowing cube uploads to reuse the same 2D upload implementations.
 * @param uploaders - Uploader registry keyed by `uploadMethodId` (must include `image`).
 * @internal
 */
export function createGlUploadCubeTextureResource(
    uploaders: Record<string, GLTextureUploader> & { image: GLTextureUploader }
): GLTextureUploader
{
    return {
        id: 'cube',
        upload(source: CubeTextureSource, glTexture: GlTexture, gl: GlRenderingContext, webGLVersion: number)
        {
            const faces = source.faces;

            // Upload each face by delegating to the standard 2D uploaders with a face-target override.
            for (let faceIndex = 0; faceIndex < FACE_ORDER.length; faceIndex++)
            {
                const key = FACE_ORDER[faceIndex];
                const face = faces[key];
                const uploader = uploaders[face.uploadMethodId] || uploaders.image;

                // Each cube face target must be initialized (texImage2D) at least once before using texSubImage2D.
                // Tell 2D uploaders to force allocation for the first upload of each face.
                uploader.upload(
                    face,
                    glTexture,
                    gl,
                    webGLVersion,
                    // Use the face target for the current face. cube faces ids go up 1 so
                    // GL_TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i addresses the i'th face target.
                    GL_TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex,
                    // Force allocation for the first upload of each face.
                    (glTexture._layerInitMask & (1 << faceIndex)) === 0
                );

                glTexture._layerInitMask |= (1 << faceIndex);
            }

            // Track size for GC / re-upload decisions.
            glTexture.width = source.pixelWidth;
            glTexture.height = source.pixelHeight;
        }
    };
}

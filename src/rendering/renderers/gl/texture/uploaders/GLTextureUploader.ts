import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';

/** @internal */
export interface GLTextureUploader
{
    id: string;
    /**
     * Uploads a texture source to the currently-bound GL texture.
     * @param {module:rendering.TextureSource} source - The texture source to upload.
     * @param {module:rendering.GlTexture} glTexture - The backing GL texture object.
     * @param {module:rendering.GlRenderingContext} gl - The GL context.
     * @param {number} webGLVersion - The WebGL major version (1 or 2).
     * @param {number} targetOverride - Optional upload target override (e.g. cube face target).
     * Defaults to `glTexture.target`.
     * @param {boolean} forceAllocation - If true, forces an allocation path (texImage2D) even if the uploader would
     * otherwise use a sub-update path (texSubImage2D). Useful for cube faces which each require an initial allocation.
     */
    upload(
        source: TextureSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        webGLVersion: number,
        targetOverride?: number,
        forceAllocation?: boolean
    ): void;
}

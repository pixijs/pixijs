import { ExtensionType } from '../extensions/Extensions';

import type { GlRenderingContext } from '../rendering/renderers/gl/context/GlRenderingContext';
import type { GlTexture } from '../rendering/renderers/gl/texture/GlTexture';
import type { GLTextureUploader } from '../rendering/renderers/gl/texture/uploaders/GLTextureUploader';
import type { HTMLSourceResource, HTMLUploadableSource } from './HTMLSourceTypes';

// Chromium 150+ collapsed the upload signature to (target, internalFormat, source).
// See https://github.com/WICG/html-in-canvas/pull/128/changes and
// https://github.com/KhronosGroup/WebGL/pull/3752.
type TexElementImage2DModern = (
    target: number,
    internalFormat: number,
    source: HTMLSourceResource,
) => void;

// Pre-Chromium 150 signature, kept for backwards compatibility.
type TexElementImage2DLegacy = (
    target: number,
    level: number,
    internalFormat: number,
    format: number,
    type: number,
    source: HTMLSourceResource,
) => void;

interface GlTexElementImageContext extends GlRenderingContext
{
    texElementImage2D?: TexElementImage2DModern | TexElementImage2DLegacy;
}

function ensureAllocated(
    gl: GlRenderingContext,
    glTexture: GlTexture,
    target: number,
    width: number,
    height: number,
): void
{
    if (glTexture.width === width && glTexture.height === height)
    {
        return;
    }

    gl.texImage2D(
        target,
        0,
        glTexture.internalFormat,
        width,
        height,
        0,
        glTexture.format,
        glTexture.type,
        null,
    );

    glTexture.width = width;
    glTexture.height = height;
}

/** @internal */
export const glUploadHTMLResource: GLTextureUploader & { extension: { type: ExtensionType; name: string } } = {

    extension: {
        type: ExtensionType.TextureUploaderWebGL,
        name: 'html',
    },

    id: 'html',

    upload(
        source: HTMLUploadableSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        _webGLVersion: number,
        targetOverride?: number,
    )
    {
        const upload = (gl as GlTexElementImageContext).texElementImage2D;

        if (!upload)
        {
            throw new Error(
                // eslint-disable-next-line max-len
                '[HTMLSource] WebGLRenderingContext.texElementImage2D is not available. Enable the browser HTML-in-Canvas API before using HTMLSource.',
            );
        }

        // targetOverride is the cube-face target when this uploader is driven by the cube uploader.
        const target = targetOverride ?? glTexture.target;
        const textureWidth = source.pixelWidth;
        const textureHeight = source.pixelHeight;

        if (!source.isReady)
        {
            // Allocate empty storage so sampling doesn't error before the first paint arrives.
            ensureAllocated(gl, glTexture, target, textureWidth, textureHeight);
            source.requestPaint?.();

            return;
        }

        // Detect the Chromium 150+ three-argument form by its arity; older builds still expect
        // the full (target, level, internalFormat, format, type, source) signature.
        if (upload.length === 3)
        {
            (upload as TexElementImage2DModern).call(gl, target, glTexture.internalFormat, source.resource);
        }
        else
        {
            (upload as TexElementImage2DLegacy).call(
                gl,
                target,
                0,
                glTexture.internalFormat,
                glTexture.format,
                glTexture.type,
                source.resource,
            );
        }

        glTexture.width = textureWidth;
        glTexture.height = textureHeight;
    },
};

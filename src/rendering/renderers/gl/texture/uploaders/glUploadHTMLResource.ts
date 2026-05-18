import type { HTMLSource } from '../../../shared/texture/sources/HTMLSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

interface GlTexElementImageContext extends GlRenderingContext
{
    texElementImage2D?: (
        target: number,
        level: number,
        internalFormat: number,
        widthOrFormat: number,
        heightOrType: number,
        formatOrSource: number | Element,
        type?: number,
        source?: Element,
    ) => void;
}

function ensureAllocated(
    gl: GlRenderingContext,
    glTexture: GlTexture,
    width: number,
    height: number,
): void
{
    if (glTexture.width === width && glTexture.height === height)
    {
        return;
    }

    gl.texImage2D(
        glTexture.target,
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
export const glUploadHTMLResource = {

    id: 'html',

    upload(
        source: HTMLSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
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

        const textureWidth = source.pixelWidth;
        const textureHeight = source.pixelHeight;

        if (!source.isReady)
        {
            // Allocate empty storage so sampling doesn't error before the first paint arrives.
            ensureAllocated(gl, glTexture, textureWidth, textureHeight);
            source.requestPaint();

            return;
        }

        const resourceWidth = source.resourceWidth;
        const resourceHeight = source.resourceHeight;
        const sameSize = resourceWidth === textureWidth && resourceHeight === textureHeight;

        if (sameSize)
        {
            upload.call(
                gl,
                glTexture.target,
                0,
                glTexture.internalFormat,
                glTexture.format,
                glTexture.type,
                source.resource as Element,
            );
        }
        else
        {
            upload.call(
                gl,
                glTexture.target,
                0,
                glTexture.internalFormat,
                textureWidth,
                textureHeight,
                glTexture.format,
                glTexture.type,
                source.resource as Element,
            );
        }

        glTexture.width = textureWidth;
        glTexture.height = textureHeight;
    },
} as GLTextureUploader;

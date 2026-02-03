import type { CanvasSource } from '../../../shared/texture/sources/CanvasSource';
import type { ImageSource } from '../../../shared/texture/sources/ImageSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

/** @internal */
export const glUploadImageResource = {

    id: 'image',

    upload(
        source: ImageSource | CanvasSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        webGLVersion: number,
        targetOverride?: number,
        forceAllocation = false
    )
    {
        const target = targetOverride || glTexture.target;

        const textureWidth = source.pixelWidth;
        const textureHeight = source.pixelHeight;

        const resourceWidth = source.resourceWidth;
        const resourceHeight = source.resourceHeight;

        if (resourceWidth < textureWidth || resourceHeight < textureHeight)
        {
            if (glWidth !== textureWidth || glHeight !== textureHeight)
            {
                gl.texImage2D(
                    glTexture.target,
                    0,
                    glTexture.internalFormat,
                    textureWidth,
                    textureHeight,
                    0,
                    glTexture.format,
                    glTexture.type,
                    null
                );
            }

            if (webGLVersion === 2)
            {
                gl.texSubImage2D(
                    gl.TEXTURE_2D,
                    0,
                    0,
                    0,
                    resourceWidth,
                    resourceHeight,
                    glTexture.format,
                    glTexture.type,
                    source.resource as TexImageSource
                );
            }
            else
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
        }
        else if (glWidth === textureWidth || glHeight === textureHeight)
        {
            gl.texImage2D(
                glTexture.target,
                0,
                glTexture.internalFormat,
                glTexture.format,
                glTexture.type,
                source.resource as TexImageSource
            );
        }
        else if (webGLVersion === 2)
        {
            gl.texImage2D(
                target,
                0,
                glTexture.internalFormat,
                textureWidth,
                textureHeight,
                0,
                glTexture.format,
                glTexture.type,
                null
            );
        }

        gl.texSubImage2D(
            target,
            0,
            0,
            0,
            resourceWidth,
            resourceHeight,
            glTexture.format,
            glTexture.type,
            resource
        );

        return;
    }

    if (!needsAllocation)
    {
        // Texture already allocated at the correct size; update in-place.
        gl.texSubImage2D(
            target,
            0,
            0,
            0,
            glTexture.format,
            glTexture.type,
            resource
        );

        return;
    }

    // WebGL2 supports the sized texImage2D overload with TexImageSource.
    gl.texImage2D(
        target,
        0,
        glTexture.internalFormat,
        textureWidth,
        textureHeight,
        0,
        glTexture.format,
        glTexture.type,
        resource
    );
}

function uploadImageWebGL1(
    gl: GlRenderingContext,
    target: number,
    glTexture: GlTexture,
    textureWidth: number,
    textureHeight: number,
    _resourceWidth: number,
    _resourceHeight: number,
    resource: TexImageSource,
    needsAllocation: boolean,
    resourceFitsTexture: boolean
): void
{
    if (!resourceFitsTexture)
    {
        // Allocate the full texture and upload the (smaller) resource into it.
        if (needsAllocation)
        {
            gl.texImage2D(
                target,
                0,
                glTexture.internalFormat,
                textureWidth,
                textureHeight,
                0,
                glTexture.format,
                glTexture.type,
                null
            );
        }

        gl.texSubImage2D(
            target,
            0,
            0,
            0,
            glTexture.format,
            glTexture.type,
            resource
        );

        return;
    }

    if (!needsAllocation)
    {
        // Texture already allocated at the correct size; update in-place.
        gl.texSubImage2D(
            target,
            0,
            0,
            0,
            glTexture.format,
            glTexture.type,
            resource
        );

        return;
    }

    // WebGL1 uses the unsized TexImageSource overload.
    gl.texImage2D(
        target,
        0,
        glTexture.internalFormat,
        glTexture.format,
        glTexture.type,
        resource
    );
}

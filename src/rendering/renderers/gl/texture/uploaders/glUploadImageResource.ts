import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';
import type { GLTextureUploader } from './GLTextureUploader';

/** @internal */
export const glUploadImageResource = {

    id: 'image',

    upload(
        source: TextureSource,
        glTexture: GlTexture,
        gl: GlRenderingContext,
        webGLVersion: number,
        targetOverride?: number,
        forceAllocation = false,
        preferSubImage = false
    )
    {
        const target = targetOverride || glTexture.target;

        const textureWidth = source.pixelWidth;
        const textureHeight = source.pixelHeight;

        const resourceWidth = source.resourceWidth;
        const resourceHeight = source.resourceHeight;

        const isWebGL2 = webGLVersion === 2;
        const needsAllocation = forceAllocation || glTexture.width !== textureWidth || glTexture.height !== textureHeight;
        const resourceFitsTexture = resourceWidth >= textureWidth && resourceHeight >= textureHeight;
        const useSubImageForAllocation = preferSubImage || !resourceFitsTexture;
        const resource = source.resource as TexImageSource;

        const uploadFunction = isWebGL2 ? uploadImageWebGL2 : uploadImageWebGL1;

        uploadFunction(
            gl,
            target,
            glTexture,
            textureWidth,
            textureHeight,
            preferSubImage ? Math.min(textureWidth, resourceWidth) : resourceWidth,
            preferSubImage ? Math.min(textureHeight, resourceHeight) : resourceHeight,
            resource,
            needsAllocation,
            useSubImageForAllocation
        );

        glTexture.width = textureWidth;
        glTexture.height = textureHeight;
    }
} satisfies GLTextureUploader;

function uploadImageWebGL2(
    gl: GlRenderingContext,
    target: number,
    glTexture: GlTexture,
    textureWidth: number,
    textureHeight: number,
    resourceWidth: number,
    resourceHeight: number,
    resource: TexImageSource,
    needsAllocation: boolean,
    useSubImageForAllocation: boolean
): void
{
    if (useSubImageForAllocation)
    {
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
    useSubImageForAllocation: boolean
): void
{
    if (useSubImageForAllocation)
    {
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

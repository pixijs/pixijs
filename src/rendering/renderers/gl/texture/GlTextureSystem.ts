import { ExtensionType } from '../../../../extensions/Extensions';
import { Texture } from '../../shared/texture/Texture';
import { GlTexture } from './GlTexture';
import { glUploadBufferImageResource } from './uploaders/glUploadBufferImageResource';
import { glUploadImageResource } from './uploaders/glUploadImageResource';
import { mapFormatToGlFormat } from './utils/mapFormatToGlFormat';
import { mapFormatToGlInternalFormat } from './utils/mapFormatToGlInternalFormat';
import { mapFormatToGlType } from './utils/mapFormatToGlType';
import {
    compareModeToGlCompare,
    mipmapScaleModeToGlFilter,
    scaleModeToGlFilter,
    wrapModeToGlAddress
} from './utils/pixiToGlMaps';

import type { ISystem } from '../../shared/system/System';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { BindableTexture } from '../../shared/texture/Texture';
import type { TextureStyle } from '../../shared/texture/TextureStyle';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GLTextureUploader } from './uploaders/GLTextureUploader';

export class GlTextureSystem implements ISystem
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'texture',
    } as const;

    readonly renderer: WebGLRenderer;

    glTextures: Record<number, GlTexture> = {};
    glSamplers: Record<string, WebGLSampler> = {};

    boundTextures: TextureSource[] = [];
    boundTexturesSamplers: number[] = [];
    activeTextureLocation = -1;

    boundSamplers: Record<number, WebGLSampler> = {};

    managedTextureSources: Record<number, TextureSource> = {};

    uploads: Record<string, GLTextureUploader> = {
        image: glUploadImageResource,
        buffer: glUploadBufferImageResource
    };

    gl: GlRenderingContext;
    mapFormatToInternalFormat: Record<string, number>;
    mapFormatToType: Record<string, number>;
    mapFormatToFormat: Record<string, number>;

    constructor(renderer: WebGLRenderer)
    {
        this.renderer = renderer;
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this.gl = gl;

        if (!this.mapFormatToInternalFormat)
        {
            this.mapFormatToInternalFormat = mapFormatToGlInternalFormat(gl);
            this.mapFormatToType = mapFormatToGlType(gl);
            this.mapFormatToFormat = mapFormatToGlFormat(gl);
        }

        for (let i = 0; i < 16; i++)
        {
            this.bind(Texture.EMPTY, i);
        }
    }

    bind(texture: BindableTexture, location = 0)
    {
        // if (this.boundTexturesSamplers[location] === texture.styleSourceKey) return;

        // this.boundTexturesSamplers[location] = texture.styleSourceKey;

        if (texture)
        {
            this.bindSource(texture.source, location);
            this.bindSampler(texture.style, location);
        }
        else
        {
            this.bindSource(null, location);
            this.bindSampler(null, location);
        }
    }

    bindSource(source: TextureSource, location = 0): void
    {
        const gl = this.gl;

        if (this.boundTextures[location] !== source)
        {
            this.boundTextures[location] = source;
            this.activateLocation(location);

            source = source || Texture.EMPTY.source;

            // bind texture and source!
            const glTexture = this.getGlSource(source);

            gl.bindTexture(glTexture.target, glTexture.texture);
        }
    }

    bindSampler(style: TextureStyle, location = 0): void
    {
        const gl = this.gl;

        if (!style)
        {
            this.boundSamplers[location] = null;
            gl.bindSampler(location, null);

            return;
        }

        const sampler = this.getGlSampler(style);

        if (this.boundSamplers[location] !== sampler)
        {
            this.boundSamplers[location] = sampler;
            gl.bindSampler(location, sampler);
        }
    }

    unbind(texture: Texture): void
    {
        const source = texture.source;
        const boundTextures = this.boundTextures;
        const gl = this.gl;

        for (let i = 0; i < boundTextures.length; i++)
        {
            if (boundTextures[i] === source)
            {
                this.activateLocation(i);

                const glTexture = this.getGlSource(source);

                gl.bindTexture(glTexture.target, null);
                boundTextures[i] = null;
            }
        }
    }

    activateLocation(location: number): void
    {
        if (this.activeTextureLocation !== location)
        {
            this.activeTextureLocation = location;
            this.gl.activeTexture(this.gl.TEXTURE0 + location);
        }
    }

    public initSource(source: TextureSource): GlTexture
    {
        const gl = this.gl;

        const glTexture = new GlTexture(gl.createTexture());

        glTexture.type = this.mapFormatToType[source.format];
        glTexture.internalFormat = this.mapFormatToInternalFormat[source.format];
        glTexture.format = this.mapFormatToFormat[source.format];

        if (source.autoGenerateMipmaps)
        {
            const biggestDimension = Math.max(source.width, source.height);

            source.mipLevelCount = Math.floor(Math.log2(biggestDimension)) + 1;
        }

        this.glTextures[source.uid] = glTexture;

        source.on('update', this.onSourceUpdate, this);
        source.on('destroy', this.onSourceDestroy, this);

        this.onSourceUpdate(source);

        return glTexture;
    }

    onSourceUpdate(source: TextureSource): void
    {
        const gl = this.gl;

        const glTexture = this.glTextures[source.uid];

        gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);

        this.boundTextures[this.activeTextureLocation] = source;

        if (this.uploads[source.type])
        {
            this.uploads[source.type].upload(source, glTexture, this.gl);

            if (source.autoGenerateMipmaps && source.mipLevelCount > 1)
            {
                gl.generateMipmap(glTexture.target);
            }
        }
        else
        {
            // eslint-disable-next-line max-len
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, source.pixelWidth, source.pixelHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
    }

    onSourceDestroy(source: TextureSource): void
    {
        const gl = this.gl;

        source.off('destroy', this.onSourceDestroy, this);
        source.off('update', this.onSourceUpdate, this);

        const glTexture = this.glTextures[source.uid];

        delete this.glTextures[source.uid];

        gl.deleteTexture(glTexture.target);
    }

    initSampler(style: TextureStyle): WebGLSampler
    {
        const gl = this.gl;

        const glSampler = this.gl.createSampler();

        this.glSamplers[style.resourceId] = glSampler;

        // 1. set the wrapping mode
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_S, wrapModeToGlAddress[style.addressModeU]);
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_T, wrapModeToGlAddress[style.addressModeV]);
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_R, wrapModeToGlAddress[style.addressModeW]);

        // 2. set the filtering mode
        gl.samplerParameteri(glSampler, gl.TEXTURE_MAG_FILTER, scaleModeToGlFilter[style.minFilter]);

        // assuming the currently bound texture is the one we want to set the filter for
        // the only smelly part of this code, WebGPU is much better here :P
        if (this.boundTextures[this.activeTextureLocation].mipLevelCount > 1)
        {
            const glFilterMode = mipmapScaleModeToGlFilter[style.minFilter][style.mipmapFilter];

            gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, glFilterMode);
        }
        else
        {
            gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, scaleModeToGlFilter[style.magFilter]);
        }

        // 3. set the anisotropy
        const anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;

        if (anisotropicExt && style.maxAnisotropy > 1)
        {
            const level = Math.min(style.maxAnisotropy, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));

            gl.samplerParameteri(glSampler, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
        }

        // 4. set the compare mode
        if (style.compare)
        {
            gl.samplerParameteri(glSampler, gl.TEXTURE_COMPARE_FUNC, compareModeToGlCompare[style.compare]);
        }

        return this.glSamplers[style.resourceId];
    }

    getGlSampler(sampler: TextureStyle): WebGLSampler
    {
        return this.glSamplers[sampler.resourceId] || this.initSampler(sampler);
    }

    getGlSource(source: TextureSource): GlTexture
    {
        return this.glTextures[source.uid] || this.initSource(source);
    }

    destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}

import { ExtensionType } from '../../../../extensions/Extensions';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { settings } from '../../../../settings/settings';
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
import { unpremultiplyAlpha } from './utils/unpremultiplyAlpha';

import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { System } from '../../shared/system/System';
import type { CanvasGenerator, GetPixelsOutput } from '../../shared/texture/GenerateCanvas';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { BindableTexture } from '../../shared/texture/Texture';
import type { TextureStyle } from '../../shared/texture/TextureStyle';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GLTextureUploader } from './uploaders/GLTextureUploader';

const TEMP_RECT = new Rectangle();
const BYTES_PER_PIXEL = 4;

export class GlTextureSystem implements System, CanvasGenerator
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'texture',
    } as const;

    public readonly managedTextures: TextureSource[] = [];

    private readonly _renderer: WebGLRenderer;

    private _glTextures: Record<number, GlTexture> = Object.create(null);
    private _glSamplers: Record<string, WebGLSampler> = Object.create(null);

    private _boundTextures: TextureSource[] = [];
    private _activeTextureLocation = -1;

    private _boundSamplers: Record<number, WebGLSampler> = Object.create(null);

    private readonly _uploads: Record<string, GLTextureUploader> = {
        image: glUploadImageResource,
        buffer: glUploadBufferImageResource
    };

    private _gl: GlRenderingContext;
    private _mapFormatToInternalFormat: Record<string, number>;
    private _mapFormatToType: Record<string, number>;
    private _mapFormatToFormat: Record<string, number>;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;

        if (!this._mapFormatToInternalFormat)
        {
            this._mapFormatToInternalFormat = mapFormatToGlInternalFormat(gl);
            this._mapFormatToType = mapFormatToGlType(gl);
            this._mapFormatToFormat = mapFormatToGlFormat(gl);
        }

        for (let i = 0; i < 16; i++)
        {
            this.bind(Texture.EMPTY, i);
        }
    }

    public bind(texture: BindableTexture, location = 0)
    {
        if (texture)
        {
            this.bindSource(texture.source, location);
            this._bindSampler(texture.style, location);
        }
        else
        {
            this.bindSource(null, location);
            this._bindSampler(null, location);
        }
    }

    public bindSource(source: TextureSource, location = 0): void
    {
        const gl = this._gl;

        source.touched = this._renderer.textureGC.count;

        if (this._boundTextures[location] !== source)
        {
            this._boundTextures[location] = source;
            this._activateLocation(location);

            source = source || Texture.EMPTY.source;

            // bind texture and source!
            const glTexture = this.getGlSource(source);

            gl.bindTexture(glTexture.target, glTexture.texture);
        }
    }

    private _bindSampler(style: TextureStyle, location = 0): void
    {
        const gl = this._gl;

        if (!style)
        {
            this._boundSamplers[location] = null;
            gl.bindSampler(location, null);

            return;
        }

        const sampler = this._getGlSampler(style);

        if (this._boundSamplers[location] !== sampler)
        {
            this._boundSamplers[location] = sampler;
            gl.bindSampler(location, sampler);
        }
    }

    public unbind(texture: BindableTexture): void
    {
        const source = texture.source;
        const boundTextures = this._boundTextures;
        const gl = this._gl;

        for (let i = 0; i < boundTextures.length; i++)
        {
            if (boundTextures[i] === source)
            {
                this._activateLocation(i);

                const glTexture = this.getGlSource(source);

                gl.bindTexture(glTexture.target, null);
                boundTextures[i] = null;
            }
        }
    }

    private _activateLocation(location: number): void
    {
        if (this._activeTextureLocation !== location)
        {
            this._activeTextureLocation = location;
            this._gl.activeTexture(this._gl.TEXTURE0 + location);
        }
    }

    private _initSource(source: TextureSource): GlTexture
    {
        const gl = this._gl;

        const glTexture = new GlTexture(gl.createTexture());

        glTexture.type = this._mapFormatToType[source.format];
        glTexture.internalFormat = this._mapFormatToInternalFormat[source.format];
        glTexture.format = this._mapFormatToFormat[source.format];

        if (source.autoGenerateMipmaps)
        {
            const biggestDimension = Math.max(source.width, source.height);

            source.mipLevelCount = Math.floor(Math.log2(biggestDimension)) + 1;
        }

        this._glTextures[source.uid] = glTexture;

        source.on('update', this.onSourceUpdate, this);
        source.on('resize', this.onSourceUpdate, this);
        source.on('destroy', this.onSourceDestroy, this);
        source.on('unload', this.onSourceUnload, this);

        this.managedTextures.push(source);

        this.onSourceUpdate(source);

        return glTexture;
    }

    protected onSourceUnload(source: TextureSource): void
    {
        const glTexture = this._glTextures[source.uid];

        if (!glTexture) return;

        this.unbind(source);
        this._glTextures[source.uid] = null;

        this._gl.deleteTexture(glTexture.texture);
    }

    protected onSourceUpdate(source: TextureSource): void
    {
        const gl = this._gl;

        const glTexture = this._glTextures[source.uid];

        gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);

        this._boundTextures[this._activeTextureLocation] = source;

        if (this._uploads[source.type])
        {
            this._uploads[source.type].upload(source, glTexture, this._gl);

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

    protected onSourceDestroy(source: TextureSource): void
    {
        source.off('destroy', this.onSourceDestroy, this);
        source.off('update', this.onSourceUpdate, this);
        source.off('unload', this.onSourceUnload, this);

        this.managedTextures.splice(this.managedTextures.indexOf(source), 1);

        this.onSourceUnload(source);
    }

    private _initSampler(style: TextureStyle): WebGLSampler
    {
        const gl = this._gl;

        const glSampler = this._gl.createSampler();

        this._glSamplers[style.resourceId] = glSampler;

        // 1. set the wrapping mode
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_S, wrapModeToGlAddress[style.addressModeU]);
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_T, wrapModeToGlAddress[style.addressModeV]);
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_R, wrapModeToGlAddress[style.addressModeW]);

        // 2. set the filtering mode
        gl.samplerParameteri(glSampler, gl.TEXTURE_MAG_FILTER, scaleModeToGlFilter[style.minFilter]);

        // assuming the currently bound texture is the one we want to set the filter for
        // the only smelly part of this code, WebGPU is much better here :P
        if (this._boundTextures[this._activeTextureLocation].mipLevelCount > 1)
        {
            const glFilterMode = mipmapScaleModeToGlFilter[style.minFilter][style.mipmapFilter];

            gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, glFilterMode);
        }
        else
        {
            gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, scaleModeToGlFilter[style.magFilter]);
        }

        // 3. set the anisotropy
        const anisotropicExt = this._renderer.context.extensions.anisotropicFiltering;

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

        return this._glSamplers[style.resourceId];
    }

    private _getGlSampler(sampler: TextureStyle): WebGLSampler
    {
        return this._glSamplers[sampler.resourceId] || this._initSampler(sampler);
    }

    public getGlSource(source: TextureSource): GlTexture
    {
        return this._glTextures[source.uid] || this._initSource(source);
    }

    public generateCanvas(texture: Texture): ICanvas
    {
        const { pixels, width, height } = this.getPixels(texture);

        const canvas = settings.ADAPTER.createCanvas();

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (ctx)
        {
            const imageData = ctx.createImageData(width, height);

            imageData.data.set(pixels);
            ctx.putImageData(imageData, 0, 0);
        }

        return canvas;
    }

    public getPixels(texture: Texture): GetPixelsOutput
    {
        const resolution = texture.source.resolution;
        const frame = TEMP_RECT;

        frame.x = texture.frameX;
        frame.y = texture.frameY;
        frame.width = texture.frameWidth;
        frame.height = texture.frameHeight;

        const width = Math.max(Math.round(frame.width * resolution), 1);
        const height = Math.max(Math.round(frame.height * resolution), 1);
        const pixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        const renderer = this._renderer;

        const renderTarget = renderer.renderTarget.getRenderTarget(texture);
        const glRenterTarget = renderer.renderTarget.getGpuRenderTarget(renderTarget);

        const gl = renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenterTarget.resolveTargetFramebuffer);

        gl.readPixels(
            Math.round(frame.x * resolution),
            Math.round(frame.y * resolution),
            width,
            height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );

        // if (texture.source.premultiplyAlpha > 0)
        // TODO - premultiplied alpha does not exist right now, need to add that back in!
        // eslint-disable-next-line no-constant-condition
        if (false)
        {
            unpremultiplyAlpha(pixels);
        }

        return { pixels: new Uint8ClampedArray(pixels.buffer), width, height };
    }

    public destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}


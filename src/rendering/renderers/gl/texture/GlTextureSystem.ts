import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { Texture } from '../../shared/texture/Texture';
import { GlTexture } from './GlTexture';
import { glUploadBufferImageResource } from './uploaders/glUploadBufferImageResource';
import { glUploadCompressedTextureResource } from './uploaders/glUploadCompressedTextureResource';
import { glUploadImageResource } from './uploaders/glUploadImageResource';
import { glUploadVideoResource } from './uploaders/glUploadVideoResource';
import { applyStyleParams } from './utils/applyStyleParams';
import { mapFormatToGlFormat } from './utils/mapFormatToGlFormat';
import { mapFormatToGlInternalFormat } from './utils/mapFormatToGlInternalFormat';
import { mapFormatToGlType } from './utils/mapFormatToGlType';
import { unpremultiplyAlpha } from './utils/unpremultiplyAlpha';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { System } from '../../shared/system/System';
import type { CanvasGenerator, GetPixelsOutput } from '../../shared/texture/GenerateCanvas';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { BindableTexture } from '../../shared/texture/Texture';
import type { TextureStyle } from '../../shared/texture/TextureStyle';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GLTextureUploader } from './uploaders/GLTextureUploader';

const BYTES_PER_PIXEL = 4;

/**
 * The system for managing textures in WebGL.
 * @memberof rendering
 */
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
        buffer: glUploadBufferImageResource,
        video: glUploadVideoResource,
        compressed: glUploadCompressedTextureResource,
    };

    private _gl: GlRenderingContext;
    private _mapFormatToInternalFormat: Record<string, number>;
    private _mapFormatToType: Record<string, number>;
    private _mapFormatToFormat: Record<string, number>;

    private _premultiplyAlpha = false;

    // TODO - separate samplers will be a cool thing to add, but not right now!
    private readonly _useSeparateSamplers = false;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
        this._renderer.renderableGC.addManagedHash(this, '_glTextures');
        this._renderer.renderableGC.addManagedHash(this, '_glSamplers');
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;

        if (!this._mapFormatToInternalFormat)
        {
            this._mapFormatToInternalFormat = mapFormatToGlInternalFormat(gl, this._renderer.context.extensions);

            this._mapFormatToType = mapFormatToGlType(gl);
            this._mapFormatToFormat = mapFormatToGlFormat(gl);
        }

        this._glTextures = Object.create(null);
        this._glSamplers = Object.create(null);
        this._boundSamplers = Object.create(null);
        this._premultiplyAlpha = false;

        for (let i = 0; i < 16; i++)
        {
            this.bind(Texture.EMPTY, i);
        }
    }

    public initSource(source: TextureSource)
    {
        this.bind(source);
    }

    public bind(texture: BindableTexture, location = 0)
    {
        const source = texture.source;

        if (texture)
        {
            this.bindSource(source, location);

            if (this._useSeparateSamplers)
            {
                this._bindSampler(source.style, location);
            }
        }
        else
        {
            this.bindSource(null, location);

            if (this._useSeparateSamplers)
            {
                this._bindSampler(null, location);
            }
        }
    }

    public bindSource(source: TextureSource, location = 0): void
    {
        const gl = this._gl;

        source._touched = this._renderer.textureGC.count;

        if (this._boundTextures[location] !== source)
        {
            this._boundTextures[location] = source;
            this._activateLocation(location);

            source ||= Texture.EMPTY.source;

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

        if (source.autoGenerateMipmaps && (this._renderer.context.supports.nonPowOf2mipmaps || source.isPowerOfTwo))
        {
            const biggestDimension = Math.max(source.width, source.height);

            source.mipLevelCount = Math.floor(Math.log2(biggestDimension)) + 1;
        }

        this._glTextures[source.uid] = glTexture;

        if (!this.managedTextures.includes(source))
        {
            source.on('update', this.onSourceUpdate, this);
            source.on('resize', this.onSourceUpdate, this);
            source.on('styleChange', this.onStyleChange, this);
            source.on('destroy', this.onSourceDestroy, this);
            source.on('unload', this.onSourceUnload, this);
            source.on('updateMipmaps', this.onUpdateMipmaps, this);

            this.managedTextures.push(source);
        }

        this.onSourceUpdate(source);
        this.updateStyle(source, false);

        return glTexture;
    }

    protected onStyleChange(source: TextureSource): void
    {
        this.updateStyle(source, false);
    }

    protected updateStyle(source: TextureSource, firstCreation: boolean): void
    {
        const gl = this._gl;

        const glTexture = this.getGlSource(source);

        gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);

        this._boundTextures[this._activeTextureLocation] = source;

        applyStyleParams(
            source.style,
            gl,
            source.mipLevelCount > 1,
            this._renderer.context.extensions.anisotropicFiltering,
            'texParameteri',
            gl.TEXTURE_2D,
            // will force a clamp to edge if the texture is not a power of two
            !this._renderer.context.supports.nonPowOf2wrapping && !source.isPowerOfTwo,
            firstCreation,
        );
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

        const glTexture = this.getGlSource(source);

        gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);

        this._boundTextures[this._activeTextureLocation] = source;

        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        if (this._premultiplyAlpha !== premultipliedAlpha)
        {
            this._premultiplyAlpha = premultipliedAlpha;
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultipliedAlpha);
        }

        if (this._uploads[source.uploadMethodId])
        {
            this._uploads[source.uploadMethodId].upload(source, glTexture, gl, this._renderer.context.webGLVersion);
        }
        else
        {
            // eslint-disable-next-line max-len
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, source.pixelWidth, source.pixelHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        if (source.autoGenerateMipmaps && source.mipLevelCount > 1)
        {
            this.onUpdateMipmaps(source, false);
        }
    }

    protected onUpdateMipmaps(source: TextureSource, bind = true): void
    {
        if (bind) this.bindSource(source, 0);

        const glTexture = this.getGlSource(source);

        this._gl.generateMipmap(glTexture.target);
    }

    protected onSourceDestroy(source: TextureSource): void
    {
        source.off('destroy', this.onSourceDestroy, this);
        source.off('update', this.onSourceUpdate, this);
        source.off('resize', this.onSourceUpdate, this);
        source.off('unload', this.onSourceUnload, this);
        source.off('styleChange', this.onStyleChange, this);
        source.off('updateMipmaps', this.onUpdateMipmaps, this);

        this.managedTextures.splice(this.managedTextures.indexOf(source), 1);

        this.onSourceUnload(source);
    }

    private _initSampler(style: TextureStyle): WebGLSampler
    {
        const gl = this._gl;

        const glSampler = this._gl.createSampler();

        this._glSamplers[style._resourceId] = glSampler;

        applyStyleParams(
            style,
            gl,
            this._boundTextures[this._activeTextureLocation].mipLevelCount > 1,
            this._renderer.context.extensions.anisotropicFiltering,
            'samplerParameteri',
            glSampler,
            false,
            true,
        );

        return this._glSamplers[style._resourceId];
    }

    private _getGlSampler(sampler: TextureStyle): WebGLSampler
    {
        return this._glSamplers[sampler._resourceId] || this._initSampler(sampler);
    }

    public getGlSource(source: TextureSource): GlTexture
    {
        return this._glTextures[source.uid] || this._initSource(source);
    }

    public generateCanvas(texture: Texture): ICanvas
    {
        const { pixels, width, height } = this.getPixels(texture);

        const canvas = DOMAdapter.get().createCanvas();

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
        const frame = texture.frame;

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
        // we copy the array as the array with a slice as onSourceDestroy
        // will remove the source from the real managedTextures array
        this.managedTextures
            .slice()
            .forEach((source) => this.onSourceDestroy(source));

        (this.managedTextures as null) = null;

        (this._renderer as null) = null;
    }

    public resetState(): void
    {
        this._activeTextureLocation = -1;
        this._boundTextures.fill(Texture.EMPTY.source);
        this._boundSamplers = Object.create(null);
    }
}


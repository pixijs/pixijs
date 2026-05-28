import { nextPow2 } from '../../../../maths/misc/pow2';
import { GlobalResourceRegistry } from '../../../../utils/pool/GlobalResourceRegistry';
import { TextureUsage } from './const';
import { TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';
import { TextureStyle } from './TextureStyle';

import type { TextureSourceOptions } from './sources/TextureSource';

let count = 0;

/**
 * The default WebGPU usage for pooled textures: rendered into, then sampled.
 * This is the narrowest set valid for transient filter/cache/mask render targets,
 * which lets tile-based GPUs keep them resident in tile memory. Callers that copy
 * into a pooled texture (e.g. text uploads, blend back-textures) must request the
 * wider set themselves. Ignored on WebGL.
 * @internal
 */
const defaultTexturePoolUsage = TextureUsage.RENDER_ATTACHMENT | TextureUsage.TEXTURE_BINDING;

/**
 * Texture pool, used by FilterSystem and plugins.
 *
 * Stores collection of temporary pow2 or screen-sized renderTextures
 *
 * If you use custom RenderTexturePool for your filters, you can use methods
 * `getFilterTexture` and `returnFilterTexture` same as in default pool
 * @category rendering
 * @advanced
 */
export class TexturePoolClass
{
    /** The default options for texture pool */
    public textureOptions: TextureSourceOptions;

    /** The default texture style for the pool */
    public textureStyle: TextureStyle;

    /**
     * Allow renderTextures of the same size as screen, not just pow2
     *
     * Automatically sets to true after `setScreenSize`
     * @default false
     */
    public enableFullScreen: boolean;

    // textures are bucketed first by gpu usage, then by a size/flag key, so a texture
    // created with narrow usage is never handed back out where wider usage is required.
    private _texturePool: Record<number, {[x in string | number]: Texture[]}>;
    private _poolKeyHash: Record<number, number> = Object.create(null);

    /**
     * @param textureOptions - options that will be passed to BaseRenderTexture constructor
     * @param {SCALE_MODE} [textureOptions.scaleMode] - See {@link SCALE_MODE} for possible values.
     */
    constructor(textureOptions?: TextureSourceOptions)
    {
        this._texturePool = {};
        this.textureOptions = textureOptions || {};
        this.enableFullScreen = false;
        this.textureStyle = new TextureStyle(this.textureOptions);
    }

    /**
     * Creates texture with params that were specified in pool constructor.
     * @param pixelWidth - Width of texture in pixels.
     * @param pixelHeight - Height of texture in pixels.
     * @param antialias
     * @param autoGenerateMipmaps - Whether to automatically generate mipmaps for this texture
     * @param usage - WebGPU texture usage flags. Defaults to render-attachment + texture-binding.
     */
    public createTexture(
        pixelWidth: number,
        pixelHeight: number,
        antialias: boolean,
        autoGenerateMipmaps: boolean,
        usage: number = defaultTexturePoolUsage
    ): Texture
    {
        const textureSource = new TextureSource({
            ...this.textureOptions,

            width: pixelWidth,
            height: pixelHeight,
            resolution: 1,
            antialias,
            autoGarbageCollect: false,
            autoGenerateMipmaps,
            gpuUsage: usage,
        });

        return new Texture({
            source: textureSource,
            label: `texturePool_${count++}`,
        });
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     * @param frameWidth - The minimum width of the render texture.
     * @param frameHeight - The minimum height of the render texture.
     * @param resolution - The resolution of the render texture.
     * @param antialias
     * @param autoGenerateMipmaps - Whether to automatically generate mipmaps. Defaults to false.
     * @param usage - WebGPU texture usage flags. Defaults to render-attachment + texture-binding,
     * the narrowest set valid for transient render targets. Callers that copy into the texture
     * (e.g. uploads or `copyTextureToTexture`) must include `TextureUsage.COPY_DST`. Ignored on WebGL.
     * @returns The new render texture.
     */
    public getOptimalTexture(
        frameWidth: number,
        frameHeight: number,
        resolution = 1,
        antialias: boolean,
        autoGenerateMipmaps = false,
        usage: number = defaultTexturePoolUsage
    ): Texture
    {
        let po2Width = Math.ceil((frameWidth * resolution) - 1e-6);
        let po2Height = Math.ceil((frameHeight * resolution) - 1e-6);

        po2Width = nextPow2(po2Width);
        po2Height = nextPow2(po2Height);

        // Pack flags in lower bits, then dimensions in higher bits to avoid collisions
        // Bit 0: antialias flag
        // Bit 1: mipmap flag
        // Bits 2-16: height (15 bits, supports up to 32768)
        // Bits 17-31: width (15 bits, supports up to 32768)
        const antialiasFlag = antialias ? 1 : 0;
        const mipmapFlag = autoGenerateMipmaps ? 1 : 0;
        const key = (po2Width << 17) + (po2Height << 2) + (mipmapFlag << 1) + antialiasFlag;

        // bucket by usage first: usage is baked into the GPU texture at creation, so textures
        // with different usage must never share a pool slot.
        const usagePool = this._texturePool[usage] ||= {};

        if (!usagePool[key])
        {
            usagePool[key] = [];
        }

        let texture = usagePool[key].pop();

        if (!texture)
        {
            texture = this.createTexture(po2Width, po2Height, antialias, autoGenerateMipmaps, usage);
        }

        texture.source._resolution = resolution;
        texture.source.width = po2Width / resolution;
        texture.source.height = po2Height / resolution;
        texture.source.pixelWidth = po2Width;
        texture.source.pixelHeight = po2Height;

        // fit the layout to the requested original size
        texture.frame.x = 0;
        texture.frame.y = 0;
        texture.frame.width = frameWidth;
        texture.frame.height = frameHeight;

        texture.updateUvs();

        this._poolKeyHash[texture.uid] = key;

        return texture;
    }

    /**
     * Gets a pooled texture matching the dimensions and resolution of the given texture.
     *
     * This is a convenience wrapper around {@link TexturePoolClass#getOptimalTexture|getOptimalTexture}
     * that copies width, height, and resolution from an existing texture. Useful when a filter needs
     * a temporary texture the same size as its input (e.g., for multi-pass blur).
     * @param texture - The texture whose dimensions to match.
     * @param antialias - Whether to use antialias on the pooled texture. Defaults to `false`.
     * @param usage - WebGPU texture usage flags. Defaults to render-attachment + texture-binding.
     * @returns A pooled texture with power-of-two backing dimensions at the source resolution.
     */
    public getSameSizeTexture(texture: Texture, antialias = false, usage: number = defaultTexturePoolUsage)
    {
        const source = texture.source;

        return this.getOptimalTexture(texture.width, texture.height, source._resolution, antialias, false, usage);
    }

    /**
     * Returns a texture to the pool so it can be reused by future
     * {@link TexturePoolClass#getOptimalTexture|getOptimalTexture}
     * or {@link TexturePoolClass#getSameSizeTexture|getSameSizeTexture} calls.
     *
     * If you modified the texture's style after obtaining it (e.g., changed filtering or wrapping),
     * pass `resetStyle = true` to restore the pool's default {@link TexturePoolClass#textureStyle|textureStyle}.
     * This prevents style changes from leaking into subsequent consumers of the same pooled texture.
     * @param renderTexture - The texture to return to the pool.
     * @param resetStyle - When `true`, replaces the texture source's style with the pool default. Defaults to `false`.
     */
    public returnTexture(renderTexture: Texture, resetStyle = false): void
    {
        const key = this._poolKeyHash[renderTexture.uid];

        // we can skip the copy if we don't need to reset the style
        if (resetStyle)
        {
            renderTexture.source.style = this.textureStyle;
        }

        // route back to the bucket matching the texture's usage (set when it was created)
        this._texturePool[renderTexture.source.gpuUsage][key].push(renderTexture);
    }

    /**
     * Clears the pool.
     * @param destroyTextures - Destroy all stored textures.
     */
    public clear(destroyTextures?: boolean): void
    {
        destroyTextures = destroyTextures !== false;
        if (destroyTextures)
        {
            for (const usage in this._texturePool)
            {
                const usagePool = this._texturePool[usage];

                for (const i in usagePool)
                {
                    const textures = usagePool[i];

                    if (textures)
                    {
                        for (let j = 0; j < textures.length; j++)
                        {
                            textures[j].destroy(true);
                        }
                    }
                }
            }
        }

        this._texturePool = {};
    }
}

/**
 * The default texture pool instance.
 * @category rendering
 * @advanced
 */
export const TexturePool = new TexturePoolClass();
GlobalResourceRegistry.register(TexturePool);

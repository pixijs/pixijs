import { isPow2, nextPow2 } from '../../../../maths/misc/pow2';
import { deprecation, v8_21_0 } from '../../../../utils/logging/deprecation';
import { warn } from '../../../../utils/logging/warn';
import { GlobalResourceRegistry } from '../../../../utils/pool/GlobalResourceRegistry';
import { TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';
import { TextureStyle } from './TextureStyle';
import { ScreenSizeRegistry } from './utils/ScreenSizeRegistry';

import type { Size } from '../../../../maths/misc/Size';
import type { SCALE_MODE, TEXTURE_FORMATS } from './const';
import type { TextureSourceOptions } from './sources/TextureSource';

let count = 0;

/** the largest dimension that fits in one of the 15 bit fields of a pool key */
const maxKeyDimension = 32767;

/** << is 32-bit, so scale and format ride above the packed size with multiply */
const scaleBit = 0x100000000;
const formatBit = 0x200000000;

const formatIds: Record<string, number> = Object.create(null);
let nextFormatId = 0;

function formatId(format: string): number
{
    const id = formatIds[format];

    if (id !== undefined) return id;

    return (formatIds[format] = nextFormatId++);
}

/**
 * A request for a texture from the pool. `width` and `height` are the minimum frame size the texture must
 * hold; the other fields are the only {@link TextureSourceOptions} the pool honours, and each falls back
 * to the pool's own options.
 * @category rendering
 * @advanced
 */
export type TexturePoolRequest = Pick<
    TextureSourceOptions,
    'resolution' | 'antialias' | 'autoGenerateMipmaps' | 'format' | 'scaleMode'
> & { width: number, height: number };

// One number isolates a bucket.
// Bits 0-31: antialias, mipmap, height, width. Bit 32: scale mode. Bits 33+: format id.
function bucketKey(
    width: number,
    height: number,
    antialias: boolean,
    autoGenerateMipmaps: boolean,
    format: TEXTURE_FORMATS,
    scaleMode: SCALE_MODE,
): number
{
    const packed = (width << 17) + (height << 2) + ((autoGenerateMipmaps ? 1 : 0) << 1) + (antialias ? 1 : 0);
    const scale = scaleMode === 'nearest' ? 1 : 0;

    return packed + (scale * scaleBit) + (formatId(format) * formatBit);
}

/**
 * Texture pool, used by FilterSystem and plugins.
 *
 * Stores collection of temporary pow2 or screen-sized renderTextures. Textures are bucketed by size,
 * flags, format and scale mode, so one pool can serve colour, float and depth targets side by side.
 * @category rendering
 * @advanced
 */
export class TexturePoolClass
{
    /** The default options for texture pool */
    public textureOptions: TextureSourceOptions;

    /** idle textures, keyed by format, scale mode, size and flags */
    private readonly _buckets = new Map<number, Texture[]>();
    /** the bucket key of every texture handed out, by texture uid */
    private _poolKey: Record<number, number> = Object.create(null);
    /** the style the pool created for every texture handed out, by texture uid */
    private _poolStyle: Record<number, TextureStyle> = Object.create(null);
    /** the screens this pool is sizing its textures for */
    private readonly _screens = new ScreenSizeRegistry();

    private _textureStyle?: TextureStyle;
    private _enableFullScreen = false;

    /**
     * @param textureOptions - options that will be passed to BaseRenderTexture constructor
     * @param {SCALE_MODE} [textureOptions.scaleMode] - See {@link SCALE_MODE} for possible values.
     */
    constructor(textureOptions?: TextureSourceOptions)
    {
        this.textureOptions = textureOptions || {};
    }

    /**
     * A style built from the pool options. The pool no longer applies it to anything.
     * @deprecated since 8.21.0, pooled textures carry their own style; pass `scaleMode` in the request instead.
     */
    get textureStyle(): TextureStyle
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_21_0, 'TexturePool.textureStyle is no longer used, pooled textures carry their own style. Pass scaleMode in the request instead.');
        // #endif

        if (!this._textureStyle) this._textureStyle = new TextureStyle(this.textureOptions);

        return this._textureStyle;
    }

    set textureStyle(value: TextureStyle)
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_21_0, 'TexturePool.textureStyle is no longer used, pooled textures carry their own style. Pass scaleMode in the request instead.');
        // #endif

        this._textureStyle = value;
    }

    /**
     * Has no effect. The pool sizes textures to the screens registered with
     * {@link TexturePoolClass#setScreenSize|setScreenSize}.
     * @deprecated since 8.21.0
     */
    get enableFullScreen(): boolean
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_21_0, 'TexturePool.enableFullScreen is no longer used, the pool sizes textures to the screens registered with setScreenSize.');
        // #endif

        return this._enableFullScreen;
    }

    set enableFullScreen(value: boolean)
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation(v8_21_0, 'TexturePool.enableFullScreen is no longer used, the pool sizes textures to the screens registered with setScreenSize.');
        // #endif

        this._enableFullScreen = value;
    }

    /**
     * Creates a texture from a request, using the pool constructor options for anything unset.
     * @param options - Width and height are in physical pixels. Format and scale mode fall back to the pool's own.
     */
    public createTexture(options: TexturePoolRequest): Texture;
    /** @deprecated since 8.21.0 */
    public createTexture(
        pixelWidth: number, pixelHeight: number, antialias?: boolean, autoGenerateMipmaps?: boolean
    ): Texture;
    public createTexture(...args: [TexturePoolRequest] | [number, number, boolean?, boolean?]): Texture
    {
        let options = args[0];

        if (typeof options === 'number')
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation(v8_21_0, 'TexturePool.createTexture params are now an options object. See params: { width, height, antialias, autoGenerateMipmaps }');
            // #endif

            options = {
                width: options,
                height: args[1] as number,
                antialias: (args[2] as boolean) ?? false,
                autoGenerateMipmaps: (args[3] as boolean) ?? false,
            };
        }

        const format = options.format ?? this.textureOptions.format ?? TextureSource.defaultOptions.format;
        const scaleMode = options.scaleMode ?? this.textureOptions.scaleMode ?? TextureStyle.defaultOptions.scaleMode;

        const textureSource = new TextureSource({
            ...this.textureOptions,

            width: options.width,
            height: options.height,
            resolution: 1,
            antialias: options.antialias ?? false,
            autoGarbageCollect: false,
            autoGenerateMipmaps: options.autoGenerateMipmaps ?? false,
            format,
            scaleMode,
        });

        return new Texture({
            source: textureSource,
            label: `texturePool_${count++}`,
        });
    }

    /**
     * Gets a Power-of-Two render texture or screen sized texture.
     *
     * Width and height are the minimum frame size. Resolution, antialias, mipmaps, format and scale
     * mode fall back to 1 / false / the pool's own options. Each format and scale mode keeps its own buckets.
     * @param options - The request, using the same fields as {@link TextureSourceOptions}.
     * @returns The new render texture.
     */
    public getOptimalTexture(options: TexturePoolRequest): Texture;
    /** @deprecated since 8.21.0 */
    public getOptimalTexture(
        frameWidth: number, frameHeight: number, resolution?: number, antialias?: boolean, autoGenerateMipmaps?: boolean
    ): Texture;
    public getOptimalTexture(...args: [TexturePoolRequest] | [number, number, number?, boolean?, boolean?]): Texture
    {
        let options = args[0];

        if (typeof options === 'number')
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation(v8_21_0, 'TexturePool.getOptimalTexture params are now an options object. See params: { width, height, resolution, antialias, autoGenerateMipmaps }');
            // #endif

            options = {
                width: options,
                height: args[1] as number,
                resolution: (args[2] as number) ?? 1,
                antialias: (args[3] as boolean) ?? false,
                autoGenerateMipmaps: (args[4] as boolean) ?? false,
            };
        }

        const frameWidth = options.width;
        const frameHeight = options.height;
        const resolution = options.resolution ?? 1;
        const antialias = options.antialias ?? false;
        const autoGenerateMipmaps = options.autoGenerateMipmaps ?? false;
        const format = options.format ?? this.textureOptions.format ?? TextureSource.defaultOptions.format;
        const scaleMode = options.scaleMode ?? this.textureOptions.scaleMode ?? TextureStyle.defaultOptions.scaleMode;

        const { width: textureWidth, height: textureHeight } = this.getOptimalSize(
            frameWidth,
            frameHeight,
            resolution,
        );

        // #if _DEBUG
        if (textureWidth > maxKeyDimension || textureHeight > maxKeyDimension)
        {
            warn(`TexturePool: ${textureWidth}x${textureHeight} is larger than the `
                + `${maxKeyDimension}px pool key limit, textures of this size may be pooled together`);
        }
        // #endif

        const key = bucketKey(textureWidth, textureHeight, antialias, autoGenerateMipmaps, format, scaleMode);
        let bucket = this._buckets.get(key);

        if (!bucket)
        {
            bucket = [];
            this._buckets.set(key, bucket);
        }

        let texture = bucket.pop();

        if (!texture)
        {
            texture = this.createTexture({
                width: textureWidth,
                height: textureHeight,
                antialias,
                autoGenerateMipmaps,
                format,
                scaleMode,
            });

            this._poolStyle[texture.uid] = texture.source.style;
        }

        texture.source._resolution = resolution;
        texture.source.width = textureWidth / resolution;
        texture.source.height = textureHeight / resolution;
        texture.source.pixelWidth = textureWidth;
        texture.source.pixelHeight = textureHeight;

        // fit the layout to the requested original size
        texture.frame.x = 0;
        texture.frame.y = 0;
        texture.frame.width = frameWidth;
        texture.frame.height = frameHeight;

        texture.updateUvs();

        this._poolKey[texture.uid] = key;

        return texture;
    }

    /**
     * The backing size, in physical pixels, that {@link TexturePoolClass#getOptimalTexture|getOptimalTexture}
     * would allocate for a request, without taking a texture from the pool.
     *
     * Each axis is the next power of two, or the smallest registered screen the request fits inside
     * (see {@link TexturePoolClass#setScreenSize|setScreenSize}). Use it when a consumer needs to know
     * where a request's content will sit inside its pooled texture before it has one, such as a uniform
     * that maps content space onto texture space.
     * @param frameWidth - The minimum width of the texture.
     * @param frameHeight - The minimum height of the texture.
     * @param resolution - The resolution of the texture.
     * @returns The width and height the pooled texture would have, in physical pixels.
     */
    public getOptimalSize(frameWidth: number, frameHeight: number, resolution = 1): Size
    {
        const pixelWidth = Math.ceil((frameWidth * resolution) - 1e-6);
        const pixelHeight = Math.ceil((frameHeight * resolution) - 1e-6);

        const po2Width = nextPow2(pixelWidth);
        const screenWidth = this._screens.getFittingWidth(pixelWidth);
        const po2Height = nextPow2(pixelHeight);
        const screenHeight = this._screens.getFittingHeight(pixelHeight);

        return {
            width: screenWidth !== undefined ? Math.min(screenWidth, po2Width) : po2Width,
            height: screenHeight !== undefined ? Math.min(screenHeight, po2Height) : po2Height,
        };
    }

    /**
     * Gets a pooled texture matching the dimensions and resolution of the given texture.
     *
     * This is a convenience wrapper around {@link TexturePoolClass#getOptimalTexture|getOptimalTexture}
     * that copies width, height, and resolution from an existing texture. Useful when a filter needs
     * a temporary texture the same size as its input (e.g., for multi-pass blur).
     * @param texture - The texture whose dimensions to match.
     * @param antialias - Whether to use antialias on the pooled texture. Defaults to `false`.
     * @returns A pooled texture with power-of-two or screen sized backing dimensions at the source resolution.
     */
    public getSameSizeTexture(texture: Texture, antialias = false)
    {
        const source = texture.source;

        return this.getOptimalTexture({
            width: texture.width,
            height: texture.height,
            resolution: source._resolution,
            antialias,
        });
    }

    /**
     * Returns a texture to the pool so it can be reused by future
     * {@link TexturePoolClass#getOptimalTexture|getOptimalTexture}
     * or {@link TexturePoolClass#getSameSizeTexture|getSameSizeTexture} calls.
     *
     * If you gave the texture a style of your own after obtaining it (a different address mode, anisotropy
     * or similar), pass `resetStyle = true` so the pool puts its own style back. Otherwise your style stays
     * on the texture and the next consumer inherits it.
     * @param renderTexture - The texture to return to the pool.
     * @param resetStyle - When `true`, restores the style the pool created for this texture. Defaults to `false`.
     */
    public returnTexture(renderTexture: Texture, resetStyle = false): void
    {
        const uid = renderTexture.uid;
        const key = this._poolKey[uid];

        if (key === undefined)
        {
            // #if _DEBUG
            warn('TexturePool: returnTexture was passed a texture that did not come from this pool, ignoring it');
            // #endif

            return;
        }

        const poolStyle = this._poolStyle[uid];

        if (resetStyle && renderTexture.source.style !== poolStyle)
        {
            renderTexture.source.style = poolStyle;
        }

        const textures = this._buckets.get(key);

        if (!textures)
        {
            // the bucket this texture belongs to was pruned (its size no longer matches a screen),
            // so there is nothing to return it to - destroy it rather than resurrect a dead bucket
            delete this._poolKey[uid];
            delete this._poolStyle[uid];
            renderTexture.destroy(true);

            return;
        }

        textures.push(renderTexture);
    }

    /**
     * Registers the screen size of a renderer with the pool, in physical pixels.
     *
     * While a screen is registered, a request that fits inside it on an axis is given that screen's size on
     * that axis instead of the next power of two, which stops a full screen filter from allocating a texture
     * far larger than the screen. Requests larger than every registered screen on an axis keep the power of
     * two size - the pool never rounds a request up to a screen it does not fit in.
     * @param rendererUid - The uid of the renderer, used to update or remove this screen later.
     * @param pixelWidth - The width of the screen in physical pixels.
     * @param pixelHeight - The height of the screen in physical pixels.
     */
    public setScreenSize(rendererUid: number, pixelWidth: number, pixelHeight: number): void
    {
        if (!this._screens.set(rendererUid, pixelWidth, pixelHeight)) return;

        this._pruneScreenTextures();
    }

    /**
     * Removes a screen previously registered with
     * {@link TexturePoolClass#setScreenSize|setScreenSize}, destroying any idle textures that were
     * only being kept for it.
     * @param rendererUid - The uid the screen was registered with.
     */
    public removeScreen(rendererUid: number): void
    {
        if (!this._screens.remove(rendererUid)) return;

        this._pruneScreenTextures();
    }

    /**
     * Destroys the idle textures in every bucket that has a non power of two dimension matching no live
     * screen. Power of two buckets are always kept, as any request can fall back to them.
     */
    private _pruneScreenTextures(): void
    {
        for (const [key, textures] of this._buckets)
        {
            const packed = key >>> 0;
            const width = packed >>> 17;
            const height = (packed >>> 2) & 0x7FFF;

            if ((isPow2(width) || this._screens.hasWidth(width))
                && (isPow2(height) || this._screens.hasHeight(height))) continue;

            this._dropTextures(textures, true);
            this._buckets.delete(key);
        }
    }

    /**
     * Forgets idle textures were ever handed out, so a later return is ignored, and optionally destroys them.
     * @param textures - The textures of one bucket.
     * @param destroy - Whether to destroy the textures as well.
     */
    private _dropTextures(textures: Texture[], destroy: boolean): void
    {
        for (let i = 0; i < textures.length; i++)
        {
            const texture = textures[i];

            delete this._poolKey[texture.uid];
            delete this._poolStyle[texture.uid];

            if (destroy) texture.destroy(true);
        }
    }

    /**
     * Clears the pool.
     * @param destroyTextures - Destroy all stored textures.
     */
    public clear(destroyTextures?: boolean): void
    {
        for (const textures of this._buckets.values())
        {
            this._dropTextures(textures, destroyTextures !== false);
        }

        this._buckets.clear();
    }
}

/**
 * The default texture pool instance.
 * @category rendering
 * @advanced
 */
export const TexturePool = new TexturePoolClass();
GlobalResourceRegistry.register(TexturePool);

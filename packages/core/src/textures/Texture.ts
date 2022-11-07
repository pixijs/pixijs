import { Point, Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { uid, TextureCache, getResolutionOfUrl, EventEmitter } from '@pixi/utils';
import { ImageResource } from './resources/ImageResource';
import { BaseTexture } from './BaseTexture';
import { TextureUvs } from './TextureUvs';

import type { IPointData, ISize } from '@pixi/math';
import type { BufferResource } from './resources/BufferResource';
import type { CanvasResource } from './resources/CanvasResource';
import type { Resource } from './resources/Resource';
import type { IBaseTextureOptions, ImageSource } from './BaseTexture';
import type { TextureMatrix } from './TextureMatrix';

const DEFAULT_UVS = new TextureUvs();

export type TextureSource = string | BaseTexture | ImageSource;

export interface Texture extends GlobalMixins.Texture, EventEmitter {}

/**
 * Used to remove listeners from WHITE and EMPTY Textures
 * @ignore
 */
function removeAllHandlers(tex: any): void
{
    tex.destroy = function _emptyDestroy(): void { /* empty */ };
    tex.on = function _emptyOn(): void { /* empty */ };
    tex.once = function _emptyOnce(): void { /* empty */ };
    tex.emit = function _emptyEmit(): void { /* empty */ };
}

/**
 * A texture stores the information that represents an image or part of an image.
 *
 * It cannot be added to the display list directly; instead use it as the texture for a Sprite.
 * If no frame is provided for a texture, then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * import { Sprite, Texture } from 'pixi.js';
 *
 * const texture = Texture.from('assets/image.png');
 * const sprite1 = new Sprite(texture);
 * const sprite2 = new Sprite(texture);
 * ```
 *
 * If you didnt pass the texture frame to constructor, it enables `noFrame` mode:
 * it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture.
 *
 * Textures made from SVGs, loaded or not, cannot be used before the file finishes processing.
 * You can check for this by checking the sprite's _textureID property.
 *
 * ```js
 * import { Sprite, Texture } from 'pixi.js';
 *
 * const texture = Texture.from('assets/image.svg');
 * const sprite1 = new Sprite(texture);
 * // sprite1._textureID should not be undefined if the texture has finished processing the SVG file
 * ```
 *
 * You can use a ticker or rAF to ensure your sprites load the finished textures after processing.
 * See issue [#3085]{@link https://github.com/pixijs/pixijs/issues/3085}.
 * @memberof PIXI
 * @typeParam R - The BaseTexture's Resource type.
 */
export class Texture<R extends Resource = Resource> extends EventEmitter
{
    /** The base texture that this texture uses. */
    public baseTexture: BaseTexture<R>;

    /** This is the area of original texture, before it was put in atlas. */
    public orig: Rectangle;

    /**
     * This is the trimmed area of original texture, before it was put in atlas
     * Please call `updateUvs()` after you change coordinates of `trim` manually.
     */
    public trim: Rectangle;

    /** This will let the renderer know if the texture is valid. If it's not then it cannot be rendered. */
    public valid: boolean;

    /**
     * Does this Texture have any frame data assigned to it?
     *
     * This mode is enabled automatically if no frame was passed inside constructor.
     *
     * In this mode texture is subscribed to baseTexture events, and fires `update` on any change.
     *
     * Beware, after loading or resize of baseTexture event can fired two times!
     * If you want more control, subscribe on baseTexture itself.
     *
     * Any assignment of `frame` switches off `noFrame` mode.
     * @example
     * texture.on('update', () => {});
     */
    public noFrame: boolean;

    /**
     * Anchor point that is used as default if sprite is created with this texture.
     * Changing the `defaultAnchor` at a later point of time will not update Sprite's anchor point.
     * @default {0,0}
     */
    public defaultAnchor: Point;

    /** Default TextureMatrix instance for this texture. By default, that object is not created because its heavy. */
    public uvMatrix: TextureMatrix;
    protected _rotate: number;

    /**
     * Update ID is observed by sprites and TextureMatrix instances.
     * Call updateUvs() to increment it.
     * @protected
     */
    _updateID: number;

    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     */
    _frame: Rectangle;

    /**
     * The WebGL UV data cache. Can be used as quad UV.
     * @protected
     */
    _uvs: TextureUvs;

    /**
     * The ids under which this Texture has been added to the texture cache. This is
     * automatically set as long as Texture.addToCache is used, but may not be set if a
     * Texture is added directly to the TextureCache array.
     */
    textureCacheIds: Array<string>;

    /**
     * @param baseTexture - The base texture source to create the texture from
     * @param frame - The rectangle frame of the texture to show
     * @param orig - The area of original texture
     * @param trim - Trimmed rectangle of original texture
     * @param rotate - indicates how the texture was rotated by texture packer. See {@link PIXI.groupD8}
     * @param anchor - Default anchor point used for sprite placement / rotation
     */
    constructor(baseTexture: BaseTexture<R>, frame?: Rectangle,
        orig?: Rectangle, trim?: Rectangle, rotate?: number, anchor?: IPointData)
    {
        super();

        this.noFrame = false;

        if (!frame)
        {
            this.noFrame = true;
            frame = new Rectangle(0, 0, 1, 1);
        }

        if (baseTexture instanceof Texture)
        {
            baseTexture = baseTexture.baseTexture;
        }

        this.baseTexture = baseTexture;
        this._frame = frame;
        this.trim = trim;
        this.valid = false;
        this._uvs = DEFAULT_UVS;
        this.uvMatrix = null;
        this.orig = orig || frame;// new Rectangle(0, 0, 1, 1);

        this._rotate = Number(rotate || 0);

        if (rotate as any === true)
        {
            // this is old texturepacker legacy, some games/libraries are passing "true" for rotated textures
            this._rotate = 2;
        }
        else if (this._rotate % 2 !== 0)
        {
            throw new Error('attempt to use diamond-shaped UVs. If you are sure, set rotation manually');
        }

        this.defaultAnchor = anchor ? new Point(anchor.x, anchor.y) : new Point(0, 0);

        this._updateID = 0;

        this.textureCacheIds = [];

        if (!baseTexture.valid)
        {
            baseTexture.once('loaded', this.onBaseTextureUpdated, this);
        }
        else if (this.noFrame)
        {
            // if there is no frame we should monitor for any base texture changes..
            if (baseTexture.valid)
            {
                this.onBaseTextureUpdated(baseTexture);
            }
        }
        else
        {
            this.frame = frame;
        }

        if (this.noFrame)
        {
            baseTexture.on('update', this.onBaseTextureUpdated, this);
        }
    }

    /**
     * Updates this texture on the gpu.
     *
     * Calls the TextureResource update.
     *
     * If you adjusted `frame` manually, please call `updateUvs()` instead.
     */
    update(): void
    {
        if (this.baseTexture.resource)
        {
            this.baseTexture.resource.update();
        }
    }

    /**
     * Called when the base texture is updated
     * @protected
     * @param baseTexture - The base texture.
     */
    onBaseTextureUpdated(baseTexture: BaseTexture): void
    {
        if (this.noFrame)
        {
            if (!this.baseTexture.valid)
            {
                return;
            }

            this._frame.width = baseTexture.width;
            this._frame.height = baseTexture.height;
            this.valid = true;
            this.updateUvs();
        }
        else
        {
            // TODO this code looks confusing.. boo to abusing getters and setters!
            // if user gave us frame that has bigger size than resized texture it can be a problem
            this.frame = this._frame;
        }

        this.emit('update', this);
    }

    /**
     * Destroys this texture
     * @param [destroyBase=false] - Whether to destroy the base texture as well
     */
    destroy(destroyBase?: boolean): void
    {
        if (this.baseTexture)
        {
            if (destroyBase)
            {
                const { resource } = this.baseTexture as unknown as BaseTexture<ImageResource>;

                // delete the texture if it exists in the texture cache..
                // this only needs to be removed if the base texture is actually destroyed too..
                if (resource?.url && TextureCache[resource.url])
                {
                    Texture.removeFromCache(resource.url);
                }

                this.baseTexture.destroy();
            }

            this.baseTexture.off('loaded', this.onBaseTextureUpdated, this);
            this.baseTexture.off('update', this.onBaseTextureUpdated, this);

            this.baseTexture = null;
        }

        this._frame = null;
        this._uvs = null;
        this.trim = null;
        this.orig = null;

        this.valid = false;

        Texture.removeFromCache(this);
        this.textureCacheIds = null;
    }

    /**
     * Creates a new texture object that acts the same as this one.
     * @returns - The new texture
     */
    clone(): Texture
    {
        const clonedFrame = this._frame.clone();
        const clonedOrig = this._frame === this.orig ? clonedFrame : this.orig.clone();
        const clonedTexture = new Texture(this.baseTexture,
            !this.noFrame && clonedFrame,
            clonedOrig,
            this.trim?.clone(),
            this.rotate,
            this.defaultAnchor
        );

        if (this.noFrame)
        {
            clonedTexture._frame = clonedFrame;
        }

        return clonedTexture;
    }

    /**
     * Updates the internal WebGL UV cache. Use it after you change `frame` or `trim` of the texture.
     * Call it after changing the frame
     */
    updateUvs(): void
    {
        if (this._uvs === DEFAULT_UVS)
        {
            this._uvs = new TextureUvs();
        }

        this._uvs.set(this._frame, this.baseTexture, this.rotate);

        this._updateID++;
    }

    /**
     * Helper function that creates a new Texture based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     * @param {string|PIXI.BaseTexture|HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas} source -
     *        Source or array of sources to create texture from
     * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
     * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
     * @returns {PIXI.Texture} The newly created texture
     */
    static from<R extends Resource = Resource, RO = any>(source: TextureSource | TextureSource[],
        options: IBaseTextureOptions<RO> = {},
        strict = settings.STRICT_TEXTURE_CACHE): Texture<R>
    {
        const isFrame = typeof source === 'string';
        let cacheId = null;

        if (isFrame)
        {
            cacheId = source;
        }
        else if (source instanceof BaseTexture)
        {
            if (!source.cacheId)
            {
                const prefix = options?.pixiIdPrefix || 'pixiid';

                source.cacheId = `${prefix}-${uid()}`;
                BaseTexture.addToCache(source, source.cacheId);
            }

            cacheId = source.cacheId;
        }
        else
        {
            if (!(source as any)._pixiId)
            {
                const prefix = options?.pixiIdPrefix || 'pixiid';

                (source as any)._pixiId = `${prefix}_${uid()}`;
            }

            cacheId = (source as any)._pixiId;
        }

        let texture = TextureCache[cacheId] as Texture<R>;

        // Strict-mode rejects invalid cacheIds
        if (isFrame && strict && !texture)
        {
            throw new Error(`The cacheId "${cacheId}" does not exist in TextureCache.`);
        }

        if (!texture && !(source instanceof BaseTexture))
        {
            if (!options.resolution)
            {
                options.resolution = getResolutionOfUrl(source as string);
            }

            texture = new Texture<R>(new BaseTexture<R>(source, options));
            texture.baseTexture.cacheId = cacheId;

            BaseTexture.addToCache(texture.baseTexture, cacheId);
            Texture.addToCache(texture, cacheId);
        }
        else if (!texture && (source instanceof BaseTexture))
        {
            texture = new Texture<R>(source as BaseTexture<R>);

            Texture.addToCache(texture, cacheId);
        }

        // lets assume its a base texture!
        return texture;
    }

    /**
     * Useful for loading textures via URLs. Use instead of `Texture.from` because
     * it does a better job of handling failed URLs more effectively. This also ignores
     * `PIXI.settings.STRICT_TEXTURE_CACHE`. Works for Videos, SVGs, Images.
     * @param url - The remote URL or array of URLs to load.
     * @param options - Optional options to include
     * @returns - A Promise that resolves to a Texture.
     */
    static fromURL<R extends Resource = Resource, RO = any>(
        url: string | string[], options?: IBaseTextureOptions<RO>): Promise<Texture<R>>
    {
        const resourceOptions = Object.assign({ autoLoad: false }, options?.resourceOptions);
        const texture = Texture.from<R>(url, Object.assign({ resourceOptions }, options), false);
        const resource = texture.baseTexture.resource;

        // The texture was already loaded
        if (texture.baseTexture.valid)
        {
            return Promise.resolve(texture);
        }

        // Manually load the texture, this should allow users to handle load errors
        return resource.load().then(() => Promise.resolve(texture));
    }

    /**
     * Create a new Texture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @param {Float32Array|Uint8Array} buffer - The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param width - Width of the resource
     * @param height - Height of the resource
     * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
     * @returns - The resulting new BaseTexture
     */
    static fromBuffer(buffer: Float32Array | Uint8Array,
        width: number, height: number, options?: IBaseTextureOptions<ISize>): Texture<BufferResource>
    {
        return new Texture(BaseTexture.fromBuffer(buffer, width, height, options));
    }

    /**
     * Create a texture from a source and add to the cache.
     * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas|string} source - The input source.
     * @param imageUrl - File name of texture, for cache and resolving resolution.
     * @param name - Human readable name for the texture cache. If no name is
     *        specified, only `imageUrl` will be used as the cache ID.
     * @param options
     * @returns - Output texture
     */
    static fromLoader<R extends Resource = Resource>(source: ImageSource | string,
        imageUrl: string, name?: string, options?: IBaseTextureOptions): Promise<Texture<R>>
    {
        const baseTexture = new BaseTexture<R>(source, Object.assign({
            scaleMode: settings.SCALE_MODE,
            resolution: getResolutionOfUrl(imageUrl),
        }, options));

        const { resource } = baseTexture;

        if (resource instanceof ImageResource)
        {
            resource.url = imageUrl;
        }

        const texture = new Texture<R>(baseTexture);

        // No name, use imageUrl instead
        if (!name)
        {
            name = imageUrl;
        }

        // lets also add the frame to pixi's global cache for 'fromLoader' function
        BaseTexture.addToCache(texture.baseTexture, name);
        Texture.addToCache(texture, name);

        // also add references by url if they are different.
        if (name !== imageUrl)
        {
            BaseTexture.addToCache(texture.baseTexture, imageUrl);
            Texture.addToCache(texture, imageUrl);
        }

        // Generally images are valid right away
        if (texture.baseTexture.valid)
        {
            return Promise.resolve(texture);
        }

        // SVG assets need to be parsed async, let's wait
        return new Promise((resolve) =>
        {
            texture.baseTexture.once('loaded', () => resolve(texture));
        });
    }

    /**
     * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
     * @param texture - The Texture to add to the cache.
     * @param id - The id that the Texture will be stored against.
     */
    static addToCache(texture: Texture, id: string): void
    {
        if (id)
        {
            if (!texture.textureCacheIds.includes(id))
            {
                texture.textureCacheIds.push(id);
            }

            if (TextureCache[id])
            {
                // eslint-disable-next-line no-console
                console.warn(`Texture added to the cache with an id [${id}] that already had an entry`);
            }

            TextureCache[id] = texture;
        }
    }

    /**
     * Remove a Texture from the global TextureCache.
     * @param texture - id of a Texture to be removed, or a Texture instance itself
     * @returns - The Texture that was removed
     */
    static removeFromCache(texture: string | Texture): Texture | null
    {
        if (typeof texture === 'string')
        {
            const textureFromCache = TextureCache[texture];

            if (textureFromCache)
            {
                const index = textureFromCache.textureCacheIds.indexOf(texture);

                if (index > -1)
                {
                    textureFromCache.textureCacheIds.splice(index, 1);
                }

                delete TextureCache[texture];

                return textureFromCache;
            }
        }
        else if (texture?.textureCacheIds)
        {
            for (let i = 0; i < texture.textureCacheIds.length; ++i)
            {
                // Check that texture matches the one being passed in before deleting it from the cache.
                if (TextureCache[texture.textureCacheIds[i]] === texture)
                {
                    delete TextureCache[texture.textureCacheIds[i]];
                }
            }

            texture.textureCacheIds.length = 0;

            return texture;
        }

        return null;
    }

    /**
     * Returns resolution of baseTexture
     * @readonly
     */
    get resolution(): number
    {
        return this.baseTexture.resolution;
    }

    /**
     * The frame specifies the region of the base texture that this texture uses.
     * Please call `updateUvs()` after you change coordinates of `frame` manually.
     */
    get frame(): Rectangle
    {
        return this._frame;
    }

    set frame(frame: Rectangle)
    {
        this._frame = frame;

        this.noFrame = false;

        const { x, y, width, height } = frame;
        const xNotFit = x + width > this.baseTexture.width;
        const yNotFit = y + height > this.baseTexture.height;

        if (xNotFit || yNotFit)
        {
            const relationship = xNotFit && yNotFit ? 'and' : 'or';
            const errorX = `X: ${x} + ${width} = ${x + width} > ${this.baseTexture.width}`;
            const errorY = `Y: ${y} + ${height} = ${y + height} > ${this.baseTexture.height}`;

            throw new Error('Texture Error: frame does not fit inside the base Texture dimensions: '
                + `${errorX} ${relationship} ${errorY}`);
        }

        this.valid = width && height && this.baseTexture.valid;

        if (!this.trim && !this.rotate)
        {
            this.orig = frame;
        }

        if (this.valid)
        {
            this.updateUvs();
        }
    }

    /**
     * Indicates whether the texture is rotated inside the atlas
     * set to 2 to compensate for texture packer rotation
     * set to 6 to compensate for spine packer rotation
     * can be used to rotate or mirror sprites
     * See {@link PIXI.groupD8} for explanation
     */
    get rotate(): number
    {
        return this._rotate;
    }

    set rotate(rotate: number)
    {
        this._rotate = rotate;
        if (this.valid)
        {
            this.updateUvs();
        }
    }

    /** The width of the Texture in pixels. */
    get width(): number
    {
        return this.orig.width;
    }

    /** The height of the Texture in pixels. */
    get height(): number
    {
        return this.orig.height;
    }

    /** Utility function for BaseTexture|Texture cast. */
    castToBaseTexture(): BaseTexture
    {
        return this.baseTexture;
    }

    private static _EMPTY: Texture<Resource>;
    private static _WHITE: Texture<CanvasResource>;

    /** An empty texture, used often to not have to create multiple empty textures. Can not be destroyed. */
    public static get EMPTY(): Texture<Resource>
    {
        if (!Texture._EMPTY)
        {
            Texture._EMPTY = new Texture(new BaseTexture());
            removeAllHandlers(Texture._EMPTY);
            removeAllHandlers(Texture._EMPTY.baseTexture);
        }

        return Texture._EMPTY;
    }

    /** A white texture of 16x16 size, used for graphics and other things Can not be destroyed. */
    public static get WHITE(): Texture<CanvasResource>
    {
        if (!Texture._WHITE)
        {
            const canvas = settings.ADAPTER.createCanvas(16, 16);
            const context = canvas.getContext('2d');

            canvas.width = 16;
            canvas.height = 16;
            context.fillStyle = 'white';
            context.fillRect(0, 0, 16, 16);

            Texture._WHITE = new Texture(BaseTexture.from(canvas));
            removeAllHandlers(Texture._WHITE);
            removeAllHandlers(Texture._WHITE.baseTexture);
        }

        return Texture._WHITE;
    }
}


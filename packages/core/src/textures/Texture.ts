import { BaseTexture } from './BaseTexture';
import { ImageResource } from './resources/ImageResource';
import { CanvasResource } from './resources/CanvasResource';
import { TextureUvs } from './TextureUvs';
import { settings } from '@pixi/settings';
import { Rectangle, Point } from '@pixi/math';
import { uid, TextureCache, getResolutionOfUrl, EventEmitter } from '@pixi/utils';

import type { IBaseTextureOptions, ImageSource } from './BaseTexture';
import type { TextureMatrix } from './TextureMatrix';

const DEFAULT_UVS = new TextureUvs();

export type TextureSource = string|BaseTexture|ImageSource;

export interface Texture extends GlobalMixins.Texture, EventEmitter {}

/**
 * A texture stores the information that represents an image or part of an image.
 *
 * It cannot be added to the display list directly; instead use it as the texture for a Sprite.
 * If no frame is provided for a texture, then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * let texture = PIXI.Texture.from('assets/image.png');
 * let sprite1 = new PIXI.Sprite(texture);
 * let sprite2 = new PIXI.Sprite(texture);
 * ```
 *
 * If you didnt pass the texture frame to constructor, it enables `noFrame` mode:
 * it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture.
 *
 * Textures made from SVGs, loaded or not, cannot be used before the file finishes processing.
 * You can check for this by checking the sprite's _textureID property.
 * ```js
 * var texture = PIXI.Texture.from('assets/image.svg');
 * var sprite1 = new PIXI.Sprite(texture);
 * //sprite1._textureID should not be undefined if the texture has finished processing the SVG file
 * ```
 * You can use a ticker or rAF to ensure your sprites load the finished textures after processing. See issue #3068.
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export class Texture extends EventEmitter
{
    public baseTexture: BaseTexture;
    public orig: Rectangle;
    public trim: Rectangle;
    public valid: boolean;
    public noFrame: boolean;
    public defaultAnchor: Point;
    public uvMatrix: TextureMatrix;
    protected _rotate: number;
    _updateID: number;
    _frame: Rectangle;
    _uvs: TextureUvs;
    textureCacheIds: Array<string>;

    /**
     * @param {PIXI.BaseTexture} baseTexture - The base texture source to create the texture from
     * @param {PIXI.Rectangle} [frame] - The rectangle frame of the texture to show
     * @param {PIXI.Rectangle} [orig] - The area of original texture
     * @param {PIXI.Rectangle} [trim] - Trimmed rectangle of original texture
     * @param {number} [rotate] - indicates how the texture was rotated by texture packer. See {@link PIXI.groupD8}
     * @param {PIXI.Point} [anchor] - Default anchor point used for sprite placement / rotation
     */
    constructor(baseTexture: BaseTexture, frame?: Rectangle,
        orig?: Rectangle, trim?: Rectangle, rotate?: number, anchor?: Point)
    {
        super();

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
         * ```js
         * texture.on('update', () => {});
         * ```
         *
         * Any assignment of `frame` switches off `noFrame` mode.
         *
         * @member {boolean}
         */
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

        /**
         * The base texture that this texture uses.
         *
         * @member {PIXI.BaseTexture}
         */
        this.baseTexture = baseTexture;

        /**
         * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
         * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
         *
         * @member {PIXI.Rectangle}
         */
        this._frame = frame;

        /**
         * This is the trimmed area of original texture, before it was put in atlas
         * Please call `updateUvs()` after you change coordinates of `trim` manually.
         *
         * @member {PIXI.Rectangle}
         */
        this.trim = trim;

        /**
         * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
         *
         * @member {boolean}
         */
        this.valid = false;

        /**
         * The WebGL UV data cache. Can be used as quad UV
         *
         * @member {PIXI.TextureUvs}
         * @protected
         */
        this._uvs = DEFAULT_UVS;

        /**
         * Default TextureMatrix instance for this texture
         * By default that object is not created because its heavy
         *
         * @member {PIXI.TextureMatrix}
         */
        this.uvMatrix = null;

        /**
         * This is the area of original texture, before it was put in atlas
         *
         * @member {PIXI.Rectangle}
         */
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

        /**
         * Anchor point that is used as default if sprite is created with this texture.
         * Changing the `defaultAnchor` at a later point of time will not update Sprite's anchor point.
         * @member {PIXI.Point}
         * @default {0,0}
         */
        this.defaultAnchor = anchor ? new Point(anchor.x, anchor.y) : new Point(0, 0);

        /**
         * Update ID is observed by sprites and TextureMatrix instances.
         * Call updateUvs() to increment it.
         *
         * @member {number}
         * @protected
         */

        this._updateID = 0;

        /**
         * The ids under which this Texture has been added to the texture cache. This is
         * automatically set as long as Texture.addToCache is used, but may not be set if a
         * Texture is added directly to the TextureCache array.
         *
         * @member {string[]}
         */
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
     *
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
     *
     * @protected
     * @param {PIXI.BaseTexture} baseTexture - The base texture.
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
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
     */
    destroy(destroyBase?: boolean): void
    {
        if (this.baseTexture)
        {
            if (destroyBase)
            {
                const resource = this.baseTexture as any;

                // delete the texture if it exists in the texture cache..
                // this only needs to be removed if the base texture is actually destroyed too..
                if (resource && resource.url && TextureCache[resource.url])
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
     *
     * @return {PIXI.Texture} The new texture
     */
    clone(): Texture
    {
        return new Texture(this.baseTexture,
            this.frame.clone(),
            this.orig.clone(),
            this.trim && this.trim.clone(),
            this.rotate,
            this.defaultAnchor
        );
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
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|PIXI.BaseTexture} source
     *        Source to create texture from
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {boolean} [strict] Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
     * @return {PIXI.Texture} The newly created texture
     */
    static from(source: TextureSource, options: IBaseTextureOptions = {},
        strict = settings.STRICT_TEXTURE_CACHE): Texture
    {
        const isFrame = typeof source === 'string';
        let cacheId = null;

        if (isFrame)
        {
            cacheId = source;
        }
        else
        {
            if (!(source as any)._pixiId)
            {
                (source as any)._pixiId = `pixiid_${uid()}`;
            }

            cacheId = (source as any)._pixiId;
        }

        let texture = TextureCache[cacheId];

        // Strict-mode rejects invalid cacheIds
        if (isFrame && strict && !texture)
        {
            throw new Error(`The cacheId "${cacheId}" does not exist in TextureCache.`);
        }

        if (!texture)
        {
            if (!options.resolution)
            {
                options.resolution = getResolutionOfUrl(source as string);
            }

            texture = new Texture(new BaseTexture(source, options));
            texture.baseTexture.cacheId = cacheId;

            BaseTexture.addToCache(texture.baseTexture, cacheId);
            Texture.addToCache(texture, cacheId);
        }

        // lets assume its a base texture!
        return texture;
    }

    /**
     * Create a new Texture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @static
     * @param {Float32Array|Uint8Array} buffer The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param {number} width - Width of the resource
     * @param {number} height - Height of the resource
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.Texture} The resulting new BaseTexture
     */
    static fromBuffer(buffer: Float32Array|Uint8Array,
        width: number, height: number, options: IBaseTextureOptions): Texture
    {
        return new Texture(BaseTexture.fromBuffer(buffer, width, height, options));
    }

    /**
     * Create a texture from a source and add to the cache.
     *
     * @static
     * @param {HTMLImageElement|HTMLCanvasElement} source - The input source.
     * @param {String} imageUrl - File name of texture, for cache and resolving resolution.
     * @param {String} [name] - Human readable name for the texture cache. If no name is
     *        specified, only `imageUrl` will be used as the cache ID.
     * @return {PIXI.Texture} Output texture
     */
    static fromLoader(source: HTMLImageElement|HTMLCanvasElement, imageUrl: string, name: string): Texture
    {
        const resource = new ImageResource(source as any);

        resource.url = imageUrl;

        const baseTexture = new BaseTexture(resource, {
            scaleMode: settings.SCALE_MODE,
            resolution: getResolutionOfUrl(imageUrl),
        });

        const texture = new Texture(baseTexture);

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

        return texture;
    }

    /**
     * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.Texture} texture - The Texture to add to the cache.
     * @param {string} id - The id that the Texture will be stored against.
     */
    static addToCache(texture: Texture, id: string): void
    {
        if (id)
        {
            if (texture.textureCacheIds.indexOf(id) === -1)
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
     *
     * @static
     * @param {string|PIXI.Texture} texture - id of a Texture to be removed, or a Texture instance itself
     * @return {PIXI.Texture|null} The Texture that was removed
     */
    static removeFromCache(texture: Texture): Texture|null
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
        else if (texture && texture.textureCacheIds)
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
     *
     * @member {number}
     * @readonly
     */
    get resolution(): number
    {
        return this.baseTexture.resolution;
    }

    /**
     * The frame specifies the region of the base texture that this texture uses.
     * Please call `updateUvs()` after you change coordinates of `frame` manually.
     *
     * @member {PIXI.Rectangle}
     */
    get frame(): Rectangle
    {
        return this._frame;
    }

    set frame(frame: Rectangle) // eslint-disable-line require-jsdoc
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
     *
     * @member {number}
     */
    get rotate(): number
    {
        return this._rotate;
    }

    set rotate(rotate) // eslint-disable-line require-jsdoc
    {
        this._rotate = rotate;
        if (this.valid)
        {
            this.updateUvs();
        }
    }

    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    get width(): number
    {
        return this.orig.width;
    }

    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    get height(): number
    {
        return this.orig.height;
    }

    /**
     * Utility function for BaseTexture|Texture cast
     */
    castToBaseTexture(): BaseTexture
    {
        return this.baseTexture;
    }

    static readonly EMPTY: Texture;
    static readonly WHITE: Texture;
}

function createWhiteTexture(): Texture
{
    const canvas = document.createElement('canvas');

    canvas.width = 16;
    canvas.height = 16;

    const context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(0, 0, 16, 16);

    return new Texture(new BaseTexture(new CanvasResource(canvas)));
}

function removeAllHandlers(tex: any): void
{
    tex.destroy = function _emptyDestroy(): void { /* empty */ };
    tex.on = function _emptyOn(): void { /* empty */ };
    tex.once = function _emptyOnce(): void { /* empty */ };
    tex.emit = function _emptyEmit(): void { /* empty */ };
}

/**
 * An empty texture, used often to not have to create multiple empty textures.
 * Can not be destroyed.
 *
 * @static
 * @constant
 * @member {PIXI.Texture}
 */
(Texture as any).EMPTY = new Texture(new BaseTexture());
removeAllHandlers(Texture.EMPTY);
removeAllHandlers(Texture.EMPTY.baseTexture);

/**
 * A white texture of 16x16 size, used for graphics and other things
 * Can not be destroyed.
 *
 * @static
 * @constant
 * @member {PIXI.Texture}
 */
(Texture as any).WHITE = createWhiteTexture();
removeAllHandlers(Texture.WHITE);
removeAllHandlers(Texture.WHITE.baseTexture);

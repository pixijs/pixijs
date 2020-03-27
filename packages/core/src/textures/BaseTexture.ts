import { BaseTextureCache, EventEmitter, isPow2, TextureCache, uid } from '@pixi/utils';
import { FORMATS, SCALE_MODES, TARGETS, TYPES, ALPHA_MODES, MIPMAP_MODES, WRAP_MODES } from '@pixi/constants';
import { Resource } from './resources/Resource';
import { BufferResource } from './resources/BufferResource';
import { autoDetectResource } from './resources/autoDetectResource';
import { settings } from '@pixi/settings';

import type { GLTexture } from './GLTexture';

const defaultBufferOptions = {
    scaleMode: SCALE_MODES.NEAREST,
    format: FORMATS.RGBA,
    alphaMode: ALPHA_MODES.NPM,
};

export type ImageSource = HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap;

export interface IBaseTextureOptions {
    alphaMode?: ALPHA_MODES;
    mipmap?: MIPMAP_MODES;
    anisotropicLevel?: number;
    scaleMode?: SCALE_MODES;
    width?: number;
    height?: number;
    wrapMode?: WRAP_MODES;
    format?: FORMATS;
    type?: TYPES;
    target?: TARGETS;
    resolution?: number;
    resourceOptions?: any;
}

export interface BaseTexture extends GlobalMixins.BaseTexture, EventEmitter {}

/**
 * A Texture stores the information that represents an image.
 * All textures have a base texture, which contains information about the source.
 * Therefore you can have many textures all using a single BaseTexture
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 * @param {PIXI.resources.Resource|string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} [resource=null]
 *        The current resource to use, for things that aren't Resource objects, will be converted
 *        into a Resource.
 * @param {Object} [options] - Collection of options
 * @param {PIXI.MIPMAP_MODES} [options.mipmap=PIXI.settings.MIPMAP_TEXTURES] - If mipmapping is enabled for texture
 * @param {number} [options.anisotropicLevel=PIXI.settings.ANISOTROPIC_LEVEL] - Anisotropic filtering level of texture
 * @param {PIXI.WRAP_MODES} [options.wrapMode=PIXI.settings.WRAP_MODE] - Wrap mode for textures
 * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.settings.SCALE_MODE] - Default scale mode, linear, nearest
 * @param {PIXI.FORMATS} [options.format=PIXI.FORMATS.RGBA] - GL format type
 * @param {PIXI.TYPES} [options.type=PIXI.TYPES.UNSIGNED_BYTE] - GL data type
 * @param {PIXI.TARGETS} [options.target=PIXI.TARGETS.TEXTURE_2D] - GL texture target
 * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Pre multiply the image alpha
 * @param {number} [options.width=0] - Width of the texture
 * @param {number} [options.height=0] - Height of the texture
 * @param {number} [options.resolution] - Resolution of the base texture
 * @param {object} [options.resourceOptions] - Optional resource options,
 *        see {@link PIXI.resources.autoDetectResource autoDetectResource}
 */
export class BaseTexture extends EventEmitter
{
    public width: number;
    public height: number;
    public resolution: number;
    public alphaMode?: ALPHA_MODES;
    public mipmap?: MIPMAP_MODES;
    public anisotropicLevel?: number;
    public scaleMode?: SCALE_MODES;
    public wrapMode?: WRAP_MODES;
    public format?: FORMATS;
    public type?: TYPES;
    public target?: TARGETS;

    protected uid: number;
    touched: number;
    isPowerOfTwo: boolean;

    _glTextures: { [key: number]: GLTexture };
    dirtyId: number;
    dirtyStyleId: number;
    public cacheId: string;
    public valid: boolean;
    textureCacheIds: Array<string>;
    public destroyed: boolean;
    public resource: Resource;
    _batchEnabled: number;
    _batchLocation: number;

    constructor(resource: Resource | ImageSource | string | any = null, options: IBaseTextureOptions = null)
    {
        super();

        options = options || {};

        const { alphaMode, mipmap, anisotropicLevel, scaleMode, width, height,
            wrapMode, format, type, target, resolution, resourceOptions } = options;

        // Convert the resource to a Resource object
        if (resource && !(resource instanceof Resource))
        {
            resource = autoDetectResource(resource, resourceOptions);
            resource.internal = true;
        }

        /**
         * The width of the base texture set when the image has loaded
         *
         * @readonly
         * @member {number}
         */
        this.width = width || 0;

        /**
         * The height of the base texture set when the image has loaded
         *
         * @readonly
         * @member {number}
         */
        this.height = height || 0;

        /**
         * The resolution / device pixel ratio of the texture
         *
         * @member {number}
         * @default PIXI.settings.RESOLUTION
         */
        this.resolution = resolution || settings.RESOLUTION;

        /**
         * Mipmap mode of the texture, affects downscaled images
         *
         * @member {PIXI.MIPMAP_MODES}
         * @default PIXI.settings.MIPMAP_TEXTURES
         */
        this.mipmap = mipmap !== undefined ? mipmap : settings.MIPMAP_TEXTURES;

        /**
         * Anisotropic filtering level of texture
         *
         * @member {number}
         * @default PIXI.settings.ANISOTROPIC_LEVEL
         */
        this.anisotropicLevel = anisotropicLevel !== undefined ? anisotropicLevel : settings.ANISOTROPIC_LEVEL;

        /**
         * How the texture wraps
         * @member {number}
         */
        this.wrapMode = wrapMode || settings.WRAP_MODE;

        /**
         * The scale mode to apply when scaling this texture
         *
         * @member {PIXI.SCALE_MODES}
         * @default PIXI.settings.SCALE_MODE
         */
        this.scaleMode = scaleMode !== undefined ? scaleMode : settings.SCALE_MODE;

        /**
         * The pixel format of the texture
         *
         * @member {PIXI.FORMATS}
         * @default PIXI.FORMATS.RGBA
         */
        this.format = format || FORMATS.RGBA;

        /**
         * The type of resource data
         *
         * @member {PIXI.TYPES}
         * @default PIXI.TYPES.UNSIGNED_BYTE
         */
        this.type = type || TYPES.UNSIGNED_BYTE;

        /**
         * The target type
         *
         * @member {PIXI.TARGETS}
         * @default PIXI.TARGETS.TEXTURE_2D
         */
        this.target = target || TARGETS.TEXTURE_2D;

        /**
         * How to treat premultiplied alpha, see {@link PIXI.ALPHA_MODES}.
         *
         * @member {PIXI.ALPHA_MODES}
         * @default PIXI.ALPHA_MODES.UNPACK
         */
        this.alphaMode = alphaMode !== undefined ? alphaMode : ALPHA_MODES.UNPACK;

        if ((options as any).premultiplyAlpha !== undefined)
        {
            // triggers deprecation
            (this as any).premultiplyAlpha = (options as any).premultiplyAlpha;
        }

        /**
         * Global unique identifier for this BaseTexture
         *
         * @member {number}
         * @protected
         */
        this.uid = uid();

        /**
         * Used by automatic texture Garbage Collection, stores last GC tick when it was bound
         *
         * @member {number}
         * @protected
         */
        this.touched = 0;

        /**
         * Whether or not the texture is a power of two, try to use power of two textures as much
         * as you can
         *
         * @readonly
         * @member {boolean}
         * @default false
         */
        this.isPowerOfTwo = false;
        this._refreshPOT();

        /**
         * The map of render context textures where this is bound
         *
         * @member {Object}
         * @private
         */
        this._glTextures = {};

        /**
         * Used by TextureSystem to only update texture to the GPU when needed.
         * Please call `update()` to increment it.
         *
         * @readonly
         * @member {number}
         */
        this.dirtyId = 0;

        /**
         * Used by TextureSystem to only update texture style when needed.
         *
         * @protected
         * @member {number}
         */
        this.dirtyStyleId = 0;

        /**
         * Currently default cache ID.
         *
         * @member {string}
         */
        this.cacheId = null;

        /**
         * Generally speaking means when resource is loaded.
         * @readonly
         * @member {boolean}
         */
        this.valid = width > 0 && height > 0;

        /**
         * The collection of alternative cache ids, since some BaseTextures
         * can have more than one ID, short name and longer full URL
         *
         * @member {Array<string>}
         * @readonly
         */
        this.textureCacheIds = [];

        /**
         * Flag if BaseTexture has been destroyed.
         *
         * @member {boolean}
         * @readonly
         */
        this.destroyed = false;

        /**
         * The resource used by this BaseTexture, there can only
         * be one resource per BaseTexture, but textures can share
         * resources.
         *
         * @member {PIXI.resources.Resource}
         * @readonly
         */
        this.resource = null;

        /**
         * Number of the texture batch, used by multi-texture renderers
         *
         * @member {number}
         */
        this._batchEnabled = 0;

        /**
         * Location inside texture batch, used by multi-texture renderers
         *
         * @member {number}
         */
        this._batchLocation = 0;

        /**
         * Fired when a not-immediately-available source finishes loading.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when a not-immediately-available source fails to load.
         *
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
         * @param {ErrorEvent} event - Load error event.
         */

        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#update
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being updated.
         */

        /**
         * Fired when BaseTexture is destroyed.
         *
         * @protected
         * @event PIXI.BaseTexture#dispose
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being destroyed.
         */

        // Set the resource
        this.setResource(resource);
    }

    /**
     * Pixel width of the source of this texture
     *
     * @readonly
     * @member {number}
     */
    get realWidth(): number
    {
        return Math.ceil((this.width * this.resolution) - 1e-4);
    }

    /**
     * Pixel height of the source of this texture
     *
     * @readonly
     * @member {number}
     */
    get realHeight(): number
    {
        return Math.ceil((this.height * this.resolution) - 1e-4);
    }

    /**
     * Changes style options of BaseTexture
     *
     * @param {PIXI.SCALE_MODES} [scaleMode] - Pixi scalemode
     * @param {PIXI.MIPMAP_MODES} [mipmap] - enable mipmaps
     * @returns {PIXI.BaseTexture} this
     */
    setStyle(scaleMode?: SCALE_MODES, mipmap?: MIPMAP_MODES): this
    {
        let dirty;

        if (scaleMode !== undefined && scaleMode !== this.scaleMode)
        {
            this.scaleMode = scaleMode;
            dirty = true;
        }

        if (mipmap !== undefined && mipmap !== this.mipmap)
        {
            this.mipmap = mipmap;
            dirty = true;
        }

        if (dirty)
        {
            this.dirtyStyleId++;
        }

        return this;
    }

    /**
     * Changes w/h/resolution. Texture becomes valid if width and height are greater than zero.
     *
     * @param {number} width Visual width
     * @param {number} height Visual height
     * @param {number} [resolution] Optionally set resolution
     * @returns {PIXI.BaseTexture} this
     */
    setSize(width: number, height: number, resolution?: number): this
    {
        this.resolution = resolution || this.resolution;
        this.width = width;
        this.height = height;
        this._refreshPOT();
        this.update();

        return this;
    }

    /**
     * Sets real size of baseTexture, preserves current resolution.
     *
     * @param {number} realWidth Full rendered width
     * @param {number} realHeight Full rendered height
     * @param {number} [resolution] Optionally set resolution
     * @returns {PIXI.BaseTexture} this
     */
    setRealSize(realWidth: number, realHeight: number, resolution?: number): this
    {
        this.resolution = resolution || this.resolution;
        this.width = realWidth / this.resolution;
        this.height = realHeight / this.resolution;
        this._refreshPOT();
        this.update();

        return this;
    }

    /**
     * Refresh check for isPowerOfTwo texture based on size
     *
     * @private
     */
    protected _refreshPOT(): void
    {
        this.isPowerOfTwo = isPow2(this.realWidth) && isPow2(this.realHeight);
    }

    /**
     * Changes resolution
     *
     * @param {number} resolution res
     * @returns {PIXI.BaseTexture} this
     */
    setResolution(resolution: number): this
    {
        const oldResolution = this.resolution;

        if (oldResolution === resolution)
        {
            return this;
        }

        this.resolution = resolution;

        if (this.valid)
        {
            this.width = this.width * oldResolution / resolution;
            this.height = this.height * oldResolution / resolution;
            this.emit('update', this);
        }

        this._refreshPOT();

        return this;
    }

    /**
     * Sets the resource if it wasn't set. Throws error if resource already present
     *
     * @param {PIXI.resources.Resource} resource - that is managing this BaseTexture
     * @returns {PIXI.BaseTexture} this
     */
    setResource(resource: Resource): this
    {
        if (this.resource === resource)
        {
            return this;
        }

        if (this.resource)
        {
            throw new Error('Resource can be set only once');
        }

        resource.bind(this);

        this.resource = resource;

        return this;
    }

    /**
     * Invalidates the object. Texture becomes valid if width and height are greater than zero.
     */
    update(): void
    {
        if (!this.valid)
        {
            if (this.width > 0 && this.height > 0)
            {
                this.valid = true;
                this.emit('loaded', this);
                this.emit('update', this);
            }
        }
        else
        {
            this.dirtyId++;
            this.dirtyStyleId++;
            this.emit('update', this);
        }
    }

    /**
     * Handle errors with resources.
     * @private
     * @param {ErrorEvent} event - Error event emitted.
     */
    onError(event: ErrorEvent): void
    {
        this.emit('error', this, event);
    }

    /**
     * Destroys this base texture.
     * The method stops if resource doesn't want this texture to be destroyed.
     * Removes texture from all caches.
     */
    destroy(): void
    {
        // remove and destroy the resource
        if (this.resource)
        {
            this.resource.unbind(this);
            // only destroy resourced created internally
            if (this.resource.internal)
            {
                this.resource.destroy();
            }
            this.resource = null;
        }

        if (this.cacheId)
        {
            delete BaseTextureCache[this.cacheId];
            delete TextureCache[this.cacheId];

            this.cacheId = null;
        }

        // finally let the WebGL renderer know..
        this.dispose();

        BaseTexture.removeFromCache(this);
        this.textureCacheIds = null;

        this.destroyed = true;
    }

    /**
     * Frees the texture from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose(): void
    {
        this.emit('dispose', this);
    }

    /**
     * Utility function for BaseTexture|Texture cast
     */
    castToBaseTexture(): BaseTexture
    {
        return this;
    }

    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element. If the
     * source is an image url or an image element and not in the base texture
     * cache, it will be created and loaded.
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement|SVGElement|HTMLVideoElement} source - The
     *        source to create base texture from.
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {boolean} [strict] Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
     * @returns {PIXI.BaseTexture} The new base texture.
     */
    static from(source: ImageSource|string, options: IBaseTextureOptions,
        strict = settings.STRICT_TEXTURE_CACHE): BaseTexture
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

        let baseTexture = BaseTextureCache[cacheId];

        // Strict-mode rejects invalid cacheIds
        if (isFrame && strict && !baseTexture)
        {
            throw new Error(`The cacheId "${cacheId}" does not exist in BaseTextureCache.`);
        }

        if (!baseTexture)
        {
            baseTexture = new BaseTexture(source, options);
            baseTexture.cacheId = cacheId;
            BaseTexture.addToCache(baseTexture, cacheId);
        }

        return baseTexture;
    }

    /**
     * Create a new BaseTexture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @static
     * @param {Float32Array|Uint8Array} buffer The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param {number} width - Width of the resource
     * @param {number} height - Height of the resource
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.BaseTexture} The resulting new BaseTexture
     */
    static fromBuffer(buffer: Float32Array|Uint8Array,
        width: number, height: number, options: IBaseTextureOptions): BaseTexture
    {
        buffer = buffer || new Float32Array(width * height * 4);

        const resource = new BufferResource(buffer, { width, height });
        const type = buffer instanceof Float32Array ? TYPES.FLOAT : TYPES.UNSIGNED_BYTE;

        return new BaseTexture(resource, Object.assign(defaultBufferOptions, options || { width, height, type }));
    }

    /**
     * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
     * @param {string} id - The id that the BaseTexture will be stored against.
     */
    static addToCache(baseTexture: BaseTexture, id: string): void
    {
        if (id)
        {
            if (baseTexture.textureCacheIds.indexOf(id) === -1)
            {
                baseTexture.textureCacheIds.push(id);
            }

            if (BaseTextureCache[id])
            {
                // eslint-disable-next-line no-console
                console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`);
            }

            BaseTextureCache[id] = baseTexture;
        }
    }

    /**
     * Remove a BaseTexture from the global BaseTextureCache.
     *
     * @static
     * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
     * @return {PIXI.BaseTexture|null} The BaseTexture that was removed.
     */
    static removeFromCache(baseTexture: string | BaseTexture): BaseTexture|null
    {
        if (typeof baseTexture === 'string')
        {
            const baseTextureFromCache = BaseTextureCache[baseTexture];

            if (baseTextureFromCache)
            {
                const index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);

                if (index > -1)
                {
                    baseTextureFromCache.textureCacheIds.splice(index, 1);
                }

                delete BaseTextureCache[baseTexture];

                return baseTextureFromCache;
            }
        }
        else if (baseTexture && baseTexture.textureCacheIds)
        {
            for (let i = 0; i < baseTexture.textureCacheIds.length; ++i)
            {
                delete BaseTextureCache[baseTexture.textureCacheIds[i]];
            }

            baseTexture.textureCacheIds.length = 0;

            return baseTexture;
        }

        return null;
    }

    /**
     * Global number of the texture batch, used by multi-texture renderers
     *
     * @static
     * @member {number}
     */
    static _globalBatch = 0;
}

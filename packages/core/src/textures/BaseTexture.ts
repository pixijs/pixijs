import { ALPHA_MODES, FORMATS, MIPMAP_MODES, SCALE_MODES, TARGETS, TYPES, WRAP_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { BaseTextureCache, EventEmitter, isPow2, TextureCache, uid } from '@pixi/utils';
import { autoDetectResource } from './resources/autoDetectResource';
import { BufferResource } from './resources/BufferResource';
import { Resource } from './resources/Resource';

import type { MSAA_QUALITY } from '@pixi/constants';
import type { ICanvas } from '@pixi/settings';
import type { GLTexture } from './GLTexture';
import type { IAutoDetectOptions } from './resources/autoDetectResource';
import type { BufferType, IBufferResourceOptions } from './resources/BufferResource';

const defaultBufferOptions = {
    scaleMode: SCALE_MODES.NEAREST,
    alphaMode: ALPHA_MODES.NPM,
};

export type ImageSource = HTMLImageElement | HTMLVideoElement | ImageBitmap | ICanvas;

export interface IBaseTextureOptions<RO = any>
{
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
    multisample?: MSAA_QUALITY;
    resourceOptions?: RO;
    pixiIdPrefix?: string;
}

export interface BaseTexture extends GlobalMixins.BaseTexture, EventEmitter {}

/**
 * A Texture stores the information that represents an image.
 * All textures have a base texture, which contains information about the source.
 * Therefore you can have many textures all using a single BaseTexture
 * @memberof PIXI
 * @typeParam R - The BaseTexture's Resource type.
 * @typeParam RO - The options for constructing resource.
 */
export class BaseTexture<R extends Resource = Resource, RO = IAutoDetectOptions> extends EventEmitter
{
    /**
     * The width of the base texture set when the image has loaded
     * @readonly
     */
    public width: number;

    /**
     * The height of the base texture set when the image has loaded
     * @readonly
     */
    public height: number;

    /**
     * The resolution / device pixel ratio of the texture
     * @readonly
     * @default PIXI.settings.RESOLUTION
     */
    public resolution: number;

    /**
     * How to treat premultiplied alpha, see {@link PIXI.ALPHA_MODES}.
     * @member {PIXI.ALPHA_MODES}
     * @default PIXI.ALPHA_MODES.UNPACK
     */
    public alphaMode: ALPHA_MODES;

    /**
     * Anisotropic filtering level of texture
     * @member {number}
     * @default 0
     */
    public anisotropicLevel: number;

    /**
     * The pixel format of the texture
     * @default PIXI.FORMATS.RGBA
     */
    public format: FORMATS;

    /**
     * The type of resource data
     * @default PIXI.TYPES.UNSIGNED_BYTE
     */
    public type: TYPES;

    /**
     * The target type
     * @default PIXI.TARGETS.TEXTURE_2D
     */
    public target: TARGETS;

    /**
     * Global unique identifier for this BaseTexture
     * @protected
     */
    public readonly uid: number;

    /**
     * Used by automatic texture Garbage Collection, stores last GC tick when it was bound
     * @protected
     */
    touched: number;

    /**
     * Whether or not the texture is a power of two, try to use power of two textures as much
     * as you can
     * @readonly
     * @default false
     */
    isPowerOfTwo: boolean;

    /**
     * The map of render context textures where this is bound
     * @private
     */
    _glTextures: { [key: number]: GLTexture };

    /**
     * Used by TextureSystem to only update texture to the GPU when needed.
     * Please call `update()` to increment it.
     * @readonly
     */
    dirtyId: number;

    /**
     * Used by TextureSystem to only update texture style when needed.
     * @protected
     */
    dirtyStyleId: number;

    /**
     * Currently default cache ID.
     * @member {string}
     */
    public cacheId: string;

    /**
     * Generally speaking means when resource is loaded.
     * @readonly
     * @member {boolean}
     */
    public valid: boolean;

    /**
     * The collection of alternative cache ids, since some BaseTextures
     * can have more than one ID, short name and longer full URL
     * @member {Array<string>}
     * @readonly
     */
    public textureCacheIds: Array<string>;

    /**
     * Flag if BaseTexture has been destroyed.
     * @member {boolean}
     * @readonly
     */
    public destroyed: boolean;

    /**
     * The resource used by this BaseTexture, there can only
     * be one resource per BaseTexture, but textures can share
     * resources.
     * @member {PIXI.Resource}
     * @readonly
     */
    public resource: R;

    /**
     * Number of the texture batch, used by multi-texture renderers
     * @member {number}
     */
    _batchEnabled: number;

    /**
     * Location inside texture batch, used by multi-texture renderers
     * @member {number}
     */
    _batchLocation: number;

    /**
     * Whether its a part of another texture, handled by ArrayResource or CubeResource
     * @member {PIXI.BaseTexture}
     */
    parentTextureArray: BaseTexture;

    private _mipmap: MIPMAP_MODES;
    private _scaleMode: SCALE_MODES;
    private _wrapMode: WRAP_MODES;

    /**
     * Default options used when creating BaseTexture objects.
     * @static
     * @memberof PIXI.BaseTexture
     * @type {PIXI.IBaseTextureOptions}
     */
    public static defaultOptions: IBaseTextureOptions = {
        /**
         * If mipmapping is enabled for texture.
         * @type {PIXI.MIPMAP_MODES}
         * @default PIXI.MIPMAP_MODES.POW2
         */
        mipmap: MIPMAP_MODES.POW2,
        /** Anisotropic filtering level of texture */
        anisotropicLevel: 0,
        /**
         * Default scale mode, linear, nearest.
         * @type {PIXI.SCALE_MODES}
         * @default PIXI.SCALE_MODES.LINEAR
         */
        scaleMode: SCALE_MODES.LINEAR,
        /**
         * Wrap mode for textures.
         * @type {PIXI.WRAP_MODES}
         * @default PIXI.WRAP_MODES.CLAMP
         */
        wrapMode: WRAP_MODES.CLAMP,
        /**
         * Pre multiply the image alpha
         * @type {PIXI.ALPHA_MODES}
         * @default PIXI.ALPHA_MODES.UNPACK
         */
        alphaMode: ALPHA_MODES.UNPACK,
        /**
         * GL texture target
         * @type {PIXI.TARGETS}
         * @default PIXI.TARGETS.TEXTURE_2D
         */
        target: TARGETS.TEXTURE_2D,
        /**
         * GL format type
         * @type {PIXI.FORMATS}
         * @default PIXI.FORMATS.RGBA
         */
        format: FORMATS.RGBA,
        /**
         * GL data type
         * @type {PIXI.TYPES}
         * @default PIXI.TYPES.UNSIGNED_BYTE
         */
        type: TYPES.UNSIGNED_BYTE,
    };

    /**
     * @param {PIXI.Resource|HTMLImageElement|HTMLVideoElement|ImageBitmap|ICanvas|string} [resource=null] -
     *        The current resource to use, for things that aren't Resource objects, will be converted
     *        into a Resource.
     * @param options - Collection of options, default options inherited from {@link PIXI.BaseTexture.defaultOptions}.
     * @param {PIXI.MIPMAP_MODES} [options.mipmap] - If mipmapping is enabled for texture
     * @param {number} [options.anisotropicLevel] - Anisotropic filtering level of texture
     * @param {PIXI.WRAP_MODES} [options.wrapMode] - Wrap mode for textures
     * @param {PIXI.SCALE_MODES} [options.scaleMode] - Default scale mode, linear, nearest
     * @param {PIXI.FORMATS} [options.format] - GL format type
     * @param {PIXI.TYPES} [options.type] - GL data type
     * @param {PIXI.TARGETS} [options.target] - GL texture target
     * @param {PIXI.ALPHA_MODES} [options.alphaMode] - Pre multiply the image alpha
     * @param {number} [options.width=0] - Width of the texture
     * @param {number} [options.height=0] - Height of the texture
     * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - Resolution of the base texture
     * @param {object} [options.resourceOptions] - Optional resource options,
     *        see {@link PIXI.autoDetectResource autoDetectResource}
     */
    constructor(resource: R | ImageSource | string | any = null, options: IBaseTextureOptions<RO> = null)
    {
        super();

        options = Object.assign({}, BaseTexture.defaultOptions, options);

        const {
            alphaMode, mipmap, anisotropicLevel, scaleMode, width, height,
            wrapMode, format, type, target, resolution, resourceOptions
        } = options;

        // Convert the resource to a Resource object
        if (resource && !(resource instanceof Resource))
        {
            resource = autoDetectResource<R, RO>(resource, resourceOptions);
            resource.internal = true;
        }

        this.resolution = resolution || settings.RESOLUTION;
        this.width = Math.round((width || 0) * this.resolution) / this.resolution;
        this.height = Math.round((height || 0) * this.resolution) / this.resolution;
        this._mipmap = mipmap;
        this.anisotropicLevel = anisotropicLevel;
        this._wrapMode = wrapMode;
        this._scaleMode = scaleMode;
        this.format = format;
        this.type = type;
        this.target = target;
        this.alphaMode = alphaMode;

        this.uid = uid();
        this.touched = 0;
        this.isPowerOfTwo = false;
        this._refreshPOT();

        this._glTextures = {};
        this.dirtyId = 0;
        this.dirtyStyleId = 0;
        this.cacheId = null;
        this.valid = width > 0 && height > 0;
        this.textureCacheIds = [];
        this.destroyed = false;
        this.resource = null;

        this._batchEnabled = 0;
        this._batchLocation = 0;
        this.parentTextureArray = null;

        /**
         * Fired when a not-immediately-available source finishes loading.
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when a not-immediately-available source fails to load.
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
         * @param {ErrorEvent} event - Load error event.
         */

        /**
         * Fired when BaseTexture is updated.
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when BaseTexture is updated.
         * @protected
         * @event PIXI.BaseTexture#update
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being updated.
         */

        /**
         * Fired when BaseTexture is destroyed.
         * @protected
         * @event PIXI.BaseTexture#dispose
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being destroyed.
         */

        // Set the resource
        this.setResource(resource);
    }

    /**
     * Pixel width of the source of this texture
     * @readonly
     */
    get realWidth(): number
    {
        return Math.round(this.width * this.resolution);
    }

    /**
     * Pixel height of the source of this texture
     * @readonly
     */
    get realHeight(): number
    {
        return Math.round(this.height * this.resolution);
    }

    /**
     * Mipmap mode of the texture, affects downscaled images
     * @default PIXI.MIPMAP_MODES.POW2
     */
    get mipmap(): MIPMAP_MODES
    {
        return this._mipmap;
    }
    set mipmap(value: MIPMAP_MODES)
    {
        if (this._mipmap !== value)
        {
            this._mipmap = value;
            this.dirtyStyleId++;
        }
    }

    /**
     * The scale mode to apply when scaling this texture
     * @default PIXI.SCALE_MODES.LINEAR
     */
    get scaleMode(): SCALE_MODES
    {
        return this._scaleMode;
    }
    set scaleMode(value: SCALE_MODES)
    {
        if (this._scaleMode !== value)
        {
            this._scaleMode = value;
            this.dirtyStyleId++;
        }
    }

    /**
     * How the texture wraps
     * @default PIXI.WRAP_MODES.CLAMP
     */
    get wrapMode(): WRAP_MODES
    {
        return this._wrapMode;
    }
    set wrapMode(value: WRAP_MODES)
    {
        if (this._wrapMode !== value)
        {
            this._wrapMode = value;
            this.dirtyStyleId++;
        }
    }

    /**
     * Changes style options of BaseTexture
     * @param scaleMode - Pixi scalemode
     * @param mipmap - enable mipmaps
     * @returns - this
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
     * @param desiredWidth - Desired visual width
     * @param desiredHeight - Desired visual height
     * @param resolution - Optionally set resolution
     * @returns - this
     */
    setSize(desiredWidth: number, desiredHeight: number, resolution?: number): this
    {
        resolution = resolution || this.resolution;

        return this.setRealSize(desiredWidth * resolution, desiredHeight * resolution, resolution);
    }

    /**
     * Sets real size of baseTexture, preserves current resolution.
     * @param realWidth - Full rendered width
     * @param realHeight - Full rendered height
     * @param resolution - Optionally set resolution
     * @returns - this
     */
    setRealSize(realWidth: number, realHeight: number, resolution?: number): this
    {
        this.resolution = resolution || this.resolution;
        this.width = Math.round(realWidth) / this.resolution;
        this.height = Math.round(realHeight) / this.resolution;
        this._refreshPOT();
        this.update();

        return this;
    }

    /**
     * Refresh check for isPowerOfTwo texture based on size
     * @private
     */
    protected _refreshPOT(): void
    {
        this.isPowerOfTwo = isPow2(this.realWidth) && isPow2(this.realHeight);
    }

    /**
     * Changes resolution
     * @param resolution - res
     * @returns - this
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
            this.width = Math.round(this.width * oldResolution) / resolution;
            this.height = Math.round(this.height * oldResolution) / resolution;
            this.emit('update', this);
        }

        this._refreshPOT();

        return this;
    }

    /**
     * Sets the resource if it wasn't set. Throws error if resource already present
     * @param resource - that is managing this BaseTexture
     * @returns - this
     */
    setResource(resource: R): this
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

    /** Invalidates the object. Texture becomes valid if width and height are greater than zero. */
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
     * @param event - Error event emitted.
     */
    onError(event: ErrorEvent): void
    {
        this.emit('error', this, event);
    }

    /**
     * Destroys this base texture.
     * The method stops if resource doesn't want this texture to be destroyed.
     * Removes texture from all caches.
     * @fires PIXI.BaseTexture#destroyed
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

        this.valid = false;

        // finally let the WebGL renderer know..
        this.dispose();

        BaseTexture.removeFromCache(this);
        this.textureCacheIds = null;

        this.destroyed = true;
        this.emit('destroyed', this);
        this.removeAllListeners();
    }

    /**
     * Frees the texture from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     * @fires PIXI.BaseTexture#dispose
     */
    dispose(): void
    {
        this.emit('dispose', this);
    }

    /** Utility function for BaseTexture|Texture cast. */
    castToBaseTexture(): BaseTexture
    {
        return this;
    }

    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element. If the
     * source is an image url or an image element and not in the base texture
     * cache, it will be created and loaded.
     * @static
     * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas|string|string[]} source - The
     *        source to create base texture from.
     * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
     * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
     * @returns {PIXI.BaseTexture} The new base texture.
     */
    static from<R extends Resource = Resource, RO = IAutoDetectOptions>(source: ImageSource | string | string[],
        options?: IBaseTextureOptions<RO>, strict = settings.STRICT_TEXTURE_CACHE): BaseTexture<R>
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
                const prefix = options?.pixiIdPrefix || 'pixiid';

                (source as any)._pixiId = `${prefix}_${uid()}`;
            }

            cacheId = (source as any)._pixiId;
        }

        let baseTexture = BaseTextureCache[cacheId] as BaseTexture<R>;

        // Strict-mode rejects invalid cacheIds
        if (isFrame && strict && !baseTexture)
        {
            throw new Error(`The cacheId "${cacheId}" does not exist in BaseTextureCache.`);
        }

        if (!baseTexture)
        {
            baseTexture = new BaseTexture<R>(source, options);
            baseTexture.cacheId = cacheId;
            BaseTexture.addToCache(baseTexture, cacheId);
        }

        return baseTexture;
    }

    /**
     * Create a new Texture with a BufferResource from a typed array.
     * @param buffer - The optional array to use. If no data is provided, a new Float32Array is created.
     * @param width - Width of the resource
     * @param height - Height of the resource
     * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
     *        Default properties are different from the constructor's defaults.
     * @param {PIXI.FORMATS} [options.format] - The format is not given, the type is inferred from the
     *        type of the buffer: `RGBA` if Float32Array, Int8Array, Uint8Array, or Uint8ClampedArray,
     *        otherwise `RGBA_INTEGER`.
     * @param {PIXI.TYPES} [options.type] - The type is not given, the type is inferred from the
     *        type of the buffer. Maps Float32Array to `FLOAT`, Int32Array to `INT`, Uint32Array to
     *        `UNSIGNED_INT`, Int16Array to `SHORT`, Uint16Array to `UNSIGNED_SHORT`, Int8Array to `BYTE`,
     *        Uint8Array/Uint8ClampedArray to `UNSIGNED_BYTE`.
     * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.NPM]
     * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.SCALE_MODES.NEAREST]
     * @returns - The resulting new BaseTexture
     */
    static fromBuffer(buffer: BufferType, width: number, height: number,
        options?: IBaseTextureOptions<IBufferResourceOptions>): BaseTexture<BufferResource>
    {
        buffer = buffer || new Float32Array(width * height * 4);

        const resource = new BufferResource(buffer, { width, height, ...options?.resourceOptions });
        let format: FORMATS;
        let type: TYPES;

        if (buffer instanceof Float32Array)
        {
            format = FORMATS.RGBA;
            type = TYPES.FLOAT;
        }
        else if (buffer instanceof Int32Array)
        {
            format = FORMATS.RGBA_INTEGER;
            type = TYPES.INT;
        }
        else if (buffer instanceof Uint32Array)
        {
            format = FORMATS.RGBA_INTEGER;
            type = TYPES.UNSIGNED_INT;
        }
        else if (buffer instanceof Int16Array)
        {
            format = FORMATS.RGBA_INTEGER;
            type = TYPES.SHORT;
        }
        else if (buffer instanceof Uint16Array)
        {
            format = FORMATS.RGBA_INTEGER;
            type = TYPES.UNSIGNED_SHORT;
        }
        else if (buffer instanceof Int8Array)
        {
            format = FORMATS.RGBA;
            type = TYPES.BYTE;
        }
        else
        {
            format = FORMATS.RGBA;
            type = TYPES.UNSIGNED_BYTE;
        }

        resource.internal = true;

        return new BaseTexture(resource, Object.assign({}, defaultBufferOptions, { type, format }, options));
    }

    /**
     * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
     * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
     * @param {string} id - The id that the BaseTexture will be stored against.
     */
    static addToCache(baseTexture: BaseTexture, id: string): void
    {
        if (id)
        {
            if (!baseTexture.textureCacheIds.includes(id))
            {
                baseTexture.textureCacheIds.push(id);
            }

            // only throw a warning if there is a different base texture mapped to this id.
            if (BaseTextureCache[id] && BaseTextureCache[id] !== baseTexture)
            {
                // eslint-disable-next-line no-console
                console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`);
            }

            BaseTextureCache[id] = baseTexture;
        }
    }

    /**
     * Remove a BaseTexture from the global BaseTextureCache.
     * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
     * @returns {PIXI.BaseTexture|null} The BaseTexture that was removed.
     */
    static removeFromCache(baseTexture: string | BaseTexture): BaseTexture | null
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
        else if (baseTexture?.textureCacheIds)
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

    /** Global number of the texture batch, used by multi-texture renderers. */
    static _globalBatch = 0;
}

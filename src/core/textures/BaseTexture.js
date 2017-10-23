import {
    uid, BaseTextureCache, TextureCache,
} from '../utils';

import { FORMATS, TARGETS, TYPES, SCALE_MODES } from '../const';
import BufferResource from './resources/BufferResource';
import createResource from './resources/createResource';

import settings from '../settings';
import EventEmitter from 'eventemitter3';
import bitTwiddle from 'bit-twiddle';

export default class BaseTexture extends EventEmitter
{

    constructor(resource,
                scaleMode = settings.SCALE_MODE,
                resolution,
                width,
                height,
                format,
                type,
                mipmap = settings.MIPMAP_TEXTURES)
    {
        super();

        this.uid = uid();

        this.touched = 0;

        /**
         * The width of texture
         *
         * @member {Number}
         */
        this.width = width || -1;
        /**
         * The height of texture
         *
         * @member {Number}
         */
        this.height = height || -1;

        /**
         * The resolution / device pixel ratio of the texture
         *
         * @member {number}
         * @default 1
         */
        this.resolution = resolution || settings.RESOLUTION;

        /**
         * Whether or not the texture is a power of two, try to use power of two textures as much
         * as you can
         *
         * @private
         * @member {boolean}
         */
        this.isPowerOfTwo = false;

        /**
         * If mipmapping was used for this texture, enable and disable with enableMipmap()
         *
         * @member {Boolean}
         */
        //  TODO fix mipmapping..
        mipmap = false;
        this.mipmap = mipmap;

        /**
         * Set to true to enable pre-multiplied alpha
         *
         * @member {Boolean}
         */
        this.premultiplyAlpha = true;

        /**
         * [wrapMode description]
         * @type {number}
         */
        this.wrapMode = settings.WRAP_MODE;

        /**
         * The scale mode to apply when scaling this texture
         *
         * @member {number}
         * @default PIXI.settings.SCALE_MODE
         * @see PIXI.SCALE_MODES
         */
        this.scaleMode = scaleMode;// || settings.SCALE_MODE;

        /**
         * The pixel format of the texture. defaults to gl.RGBA
         *
         * @member {Number}
         */
        this.format = format || FORMATS.RGBA;
        this.type = type || TYPES.UNSIGNED_BYTE; // UNSIGNED_BYTE

        this.target = TARGETS.TEXTURE_2D; // gl.TEXTURE_2D

        this._glTextures = {};

        this._new = true;

        this.dirtyId = 0;

        this.valid = false;

        this.resource = null;

        if (resource)
        {
            // lets convert this to a resource..
            resource = createResource(resource);
            this.setResource(resource);
        }

        this.cacheId = null;

        this.validate();

        this.textureCacheIds = [];

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
         */

        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when BaseTexture is destroyed.
         *
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
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
    }

    updateResolution()
    {
        const resource = this.resource;

        if (resource && resource.width !== -1 && resource.hight !== -1)
        {
            this.width = resource.width / this.resolution;
            this.height = resource.height / this.resolution;
        }
    }

    setResource(resource)
    {
        // TODO currently a resource can only be set once..

        if (this.resource)
        {
            this.resource.resourceUpdated.remove(this);
        }

        this.resource = resource;

        resource.resourceUpdated.add(this); // calls resourceUpaded

        if (resource.loaded)
        {
            this.resourceLoaded(resource);
        }

        resource.load
        .then(this.resourceLoaded.bind(this))
        .catch((reason) =>
        {
            // failed to load - maybe resource was destroyed before it loaded.
            console.warn(reason);
        });
    }

    resourceLoaded(resource)
    {
        if (this.resource === resource)
        {
            this.updateResolution();

            this.validate();

            if (this.valid)
            {
                this.isPowerOfTwo = bitTwiddle.isPow2(this.realWidth) && bitTwiddle.isPow2(this.realHeight);

                // we have not swapped half way!
                this.dirtyId++;

                this.emit('loaded', this);
            }
        }
    }

    resourceUpdated()
    {
        // the resource was updated..
        this.dirtyId++;
    }

    update()
    {
        this.dirtyId++;
    }

    resize(width, height)
    {
        this.width = width;
        this.height = height;

        this.dirtyId++;
    }

    validate()
    {
        let valid = true;

        if (this.width === -1 || this.height === -1)
        {
            valid = false;
        }

        this.valid = valid;
    }

    get realWidth()
    {
        return this.width * this.resolution;
    }

    get realHeight()
    {
        return this.height * this.resolution;
    }

    /**
     * Destroys this base texture
     *
     */
    destroy()
    {
        if (this.cacheId)
        {
            delete BaseTextureCache[this.cacheId];
            delete TextureCache[this.cacheId];

            this.cacheId = null;
        }

        // remove and destroy the resource

        if (this.resource)
        {
            this.resource.destroy();
            this.resource = null;
        }

        // finally let the webGL renderer know..
        this.dispose();

        BaseTexture.removeFromCache(this);
        this.textureCacheIds = null;
    }

    /**
     * Frees the texture from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose()
    {
        this.emit('dispose', this);
    }

    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element.
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement} source - The source to create base texture from.
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [sourceScale=(auto)] - Scale for the original image, used with Svg images.
     * @return {PIXI.BaseTexture} The new base texture.
     */
    static from(source, scaleMode)
    {
        let cacheId = null;

        if (typeof source === 'string')
        {
            cacheId = source;
        }
        else
        {
            if (!source._pixiId)
            {
                source._pixiId = `pixiid_${uid()}`;
            }

            cacheId = source._pixiId;
        }

        let baseTexture = BaseTextureCache[cacheId];

        if (!baseTexture)
        {
            baseTexture = new BaseTexture(source, scaleMode);
            baseTexture.cacheId = cacheId;
            BaseTexture.addToCache(baseTexture, cacheId);
        }

        return baseTexture;
    }

    static fromFloat32Array(width, height, float32Array)
    {
        float32Array = float32Array || new Float32Array(width * height * 4);

        const texture = new BaseTexture(new BufferResource(float32Array),
                                  SCALE_MODES.NEAREST,
                                  1,
                                  width,
                                  height,
                                  FORMATS.RGBA,
                                  TYPES.FLOAT);

        return texture;
    }

    static fromUint8Array(width, height, uint8Array)
    {
        uint8Array = uint8Array || new Uint8Array(width * height * 4);

        const texture = new BaseTexture(new BufferResource(uint8Array),
                                  SCALE_MODES.NEAREST,
                                  1,
                                  width,
                                  height,
                                  FORMATS.RGBA,
                                  TYPES.UNSIGNED_BYTE);

        return texture;
    }

    /**
     * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
     * @param {string} id - The id that the BaseTexture will be stored against.
     */
    static addToCache(baseTexture, id)
    {
        if (id)
        {
            if (baseTexture.textureCacheIds.indexOf(id) === -1)
            {
                baseTexture.textureCacheIds.push(id);
            }

            // @if DEBUG
            /* eslint-disable no-console */
            if (BaseTextureCache[id])
            {
                console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`);
            }
            /* eslint-enable no-console */
            // @endif

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
    static removeFromCache(baseTexture)
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
}

BaseTexture.fromFrame = BaseTexture.fromFrame;
BaseTexture.fromImage = BaseTexture.from;
BaseTexture.fromSVG = BaseTexture.from;
BaseTexture.fromCanvas = BaseTexture.from;

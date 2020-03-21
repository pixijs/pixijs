import { Resource } from './Resource';
import { TARGETS } from '@pixi/constants';
import { BaseTexture } from '../BaseTexture';
import { autoDetectResource } from './autoDetectResource';

import type { BaseImageResource } from './BaseImageResource';
import type { Renderer } from '../../Renderer';
import type { GLTexture } from '../GLTexture';
import type { ISize } from '@pixi/math';

/**
 * A resource that contains a number of sources.
 *
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 * @param {number|Array<*>} source - Number of items in array or the collection
 *        of image URLs to use. Can also be resources, image elements, canvas, etc.
 * @param {object} [options] Options to apply to {@link PIXI.resources.autoDetectResource}
 * @param {number} [options.width] - Width of the resource
 * @param {number} [options.height] - Height of the resource
 */
export class ArrayResource extends Resource
{
    readonly length: number;
    items: Array<BaseTexture>;
    itemDirtyIds: Array<number>;
    private _load: Promise<ArrayResource>;

    constructor(source: number|Array<any>, options?: ISize)
    {
        const { width, height } = options || {};

        let urls;
        let length: number;

        if (Array.isArray(source))
        {
            urls = source;
            length = source.length;
        }
        else
        {
            length = source;
        }

        super(width, height);

        /**
         * Collection of resources.
         * @member {Array<PIXI.BaseTexture>}
         * @readonly
         */
        this.items = [];

        /**
         * Dirty IDs for each part
         * @member {Array<number>}
         * @readonly
         */
        this.itemDirtyIds = [];

        for (let i = 0; i < length; i++)
        {
            const partTexture = new BaseTexture();

            this.items.push(partTexture);
            this.itemDirtyIds.push(-1);
        }

        /**
         * Number of elements in array
         *
         * @member {number}
         * @readonly
         */
        this.length = length;

        /**
         * Promise when loading
         * @member {Promise}
         * @private
         * @default null
         */
        this._load = null;

        if (urls)
        {
            for (let i = 0; i < length; i++)
            {
                this.addResourceAt(autoDetectResource(urls[i], options), i);
            }
        }
    }

    /**
     * Destroy this BaseImageResource
     * @override
     */
    dispose(): void
    {
        for (let i = 0, len = this.length; i < len; i++)
        {
            this.items[i].destroy();
        }
        this.items = null;
        this.itemDirtyIds = null;
        this._load = null;
    }

    /**
     * Set a resource by ID
     *
     * @param {PIXI.resources.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.ArrayResource} Instance for chaining
     */
    addResourceAt(resource: Resource, index: number): this
    {
        const baseTexture = this.items[index];

        if (!baseTexture)
        {
            throw new Error(`Index ${index} is out of bounds`);
        }

        // Inherit the first resource dimensions
        if (resource.valid && !this.valid)
        {
            this.resize(resource.width, resource.height);
        }

        this.items[index].setResource(resource);

        return this;
    }

    /**
     * Set the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    bind(baseTexture: BaseTexture): void
    {
        super.bind(baseTexture);

        baseTexture.target = TARGETS.TEXTURE_2D_ARRAY;

        for (let i = 0; i < this.length; i++)
        {
            this.items[i].on('update', baseTexture.update, baseTexture);
        }
    }

    /**
     * Unset the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    unbind(baseTexture: BaseTexture): void
    {
        super.unbind(baseTexture);

        for (let i = 0; i < this.length; i++)
        {
            this.items[i].off('update', baseTexture.update, baseTexture);
        }
    }

    /**
     * Load all the resources simultaneously
     * @override
     * @return {Promise<void>} When load is resolved
     */
    load(): Promise<ArrayResource>
    {
        if (this._load)
        {
            return this._load;
        }

        const resources = this.items.map((item) => item.resource);

        // TODO: also implement load part-by-part strategy
        const promises = resources.map((item) => item.load());

        this._load = Promise.all(promises)
            .then(() =>
            {
                const { width, height } = resources[0];

                this.resize(width, height);

                return Promise.resolve(this);
            }
            );

        return this._load;
    }

    /**
     * Upload the resources to the GPU.
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BaseTexture} texture
     * @param {PIXI.GLTexture} glTexture
     * @returns {boolean} whether texture was uploaded
     */
    upload(renderer: Renderer, texture: BaseTexture, glTexture: GLTexture): boolean
    {
        const { length, itemDirtyIds, items } = this;
        const { gl } = renderer;

        if (glTexture.dirtyId < 0)
        {
            gl.texImage3D(
                gl.TEXTURE_2D_ARRAY,
                0,
                texture.format,
                this._width,
                this._height,
                length,
                0,
                texture.format,
                texture.type,
                null
            );
        }

        for (let i = 0; i < length; i++)
        {
            const item = items[i];

            if (itemDirtyIds[i] < item.dirtyId)
            {
                itemDirtyIds[i] = item.dirtyId;
                if (item.valid)
                {
                    gl.texSubImage3D(
                        gl.TEXTURE_2D_ARRAY,
                        0,
                        0, // xoffset
                        0, // yoffset
                        i, // zoffset
                        item.resource.width,
                        item.resource.height,
                        1,
                        texture.format,
                        texture.type,
                        (item.resource as BaseImageResource).source
                    );
                }
            }
        }

        return true;
    }
}

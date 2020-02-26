import { Resource } from './Resource';
import { BaseTexture } from '../BaseTexture';
import { ISize } from '@pixi/math';
import { autoDetectResource } from './autoDetectResource';

/**
 * Resource that can manage several resource (items) inside.
 * All resources need to have the same pixel size.
 * Parent class for CubeResource and ArrayResource
 *
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 * @param {object} [options] Options to for Resource constructor
 * @param {number} [options.width] - Width of the resource
 * @param {number} [options.height] - Height of the resource
 */
export abstract class AbstractMultiResource extends Resource
{
    readonly length: number;
    items: Array<BaseTexture>;
    itemDirtyIds: Array<number>;
    private _load: Promise<this>;

    baseTexture: BaseTexture;

    constructor(source: number|Array<any>, options?: ISize)
    {
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

        const { width, height } = options || {};

        super(width, height);
        /**
         * Collection of partial baseTextures that correspond to resources
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

        /**
         * Bound baseTexture, there can only be one
         */
        this.baseTexture = null;

        if (urls)
        {
            for (let i = 0; i < length; i++)
            {
                if (urls[i].castToBaseTexture)
                {
                    this.addBaseTextureAt(urls[i].castToBaseTexture(), i);
                }
                else
                {
                    this.addResourceAt(autoDetectResource(urls[i], options), i);
                }
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
     * Set a baseTexture by ID
     *
     * @param {PIXI.BaseTexture.BaseTexture} baseTexture
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.AbstractMultiResource} Instance for chaining
     */
    abstract addBaseTextureAt(baseTexture: BaseTexture, index: number): this;

    /**
     * Set a resource by ID
     *
     * @param {PIXI.resources.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.ArrayResource} Instance for chaining
     */
    addResourceAt(resource: Resource, index: number): this
    {
        if (!this.items[index])
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
        if (this.baseTexture !== null)
        {
            throw new Error('Only one base texture per TextureArray is allowed');
        }
        super.bind(baseTexture);

        for (let i = 0; i < this.length; i++)
        {
            this.items[i].parentTextureArray = baseTexture;
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
            this.items[i].parentTextureArray = null;
            this.items[i].off('update', baseTexture.update, baseTexture);
        }
    }

    /**
     * Load all the resources simultaneously
     * @override
     * @return {Promise<void>} When load is resolved
     */
    load(): Promise<this>
    {
        if (this._load)
        {
            return this._load;
        }

        const resources = this.items.map((item) => item.resource).filter((item) => item);

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
}

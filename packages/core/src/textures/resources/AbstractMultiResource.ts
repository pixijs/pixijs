import { Resource } from './Resource';
import { BaseTexture } from '../BaseTexture';
import { ISize } from '@pixi/math';
import { autoDetectResource, IAutoDetectOptions } from './autoDetectResource';

/**
 * Resource that can manage several resource (items) inside.
 * All resources need to have the same pixel size.
 * Parent class for CubeResource and ArrayResource
 *
 * @class
 * @extends PIXI.Resource
 * @memberof PIXI
 */
export abstract class AbstractMultiResource extends Resource
{
    readonly length: number;
    items: Array<BaseTexture>;
    itemDirtyIds: Array<number>;
    private _load: Promise<this>;

    baseTexture: BaseTexture;

    /**
     * @param {number} length
     * @param {object} [options] - Options to for Resource constructor
     * @param {number} [options.width] - Width of the resource
     * @param {number} [options.height] - Height of the resource
     */
    constructor(length: number, options?: ISize)
    {
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
            // -2 - first run of texture array upload
            // -1 - texture item was allocated
            // >=0 - texture item uploaded , in sync with items[i].dirtyId
            this.itemDirtyIds.push(-2);
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
         * @member {PIXI.BaseTexture}
         */
        this.baseTexture = null;
    }

    /**
     * used from ArrayResource and CubeResource constructors
     * @param {Array<*>} resources - Can be resources, image elements, canvas, etc. ,
     *  length should be same as constructor length
     * @param {object} [options] - detect options for resources
     * @protected
     */
    protected initFromArray(resources: Array<any>, options?: IAutoDetectOptions): void
    {
        for (let i = 0; i < this.length; i++)
        {
            if (!resources[i])
            {
                continue;
            }
            if (resources[i].castToBaseTexture)
            {
                this.addBaseTextureAt(resources[i].castToBaseTexture(), i);
            }
            else if (resources[i] instanceof Resource)
            {
                this.addResourceAt(resources[i], i);
            }
            else
            {
                this.addResourceAt(autoDetectResource(resources[i], options), i);
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
     * @param {PIXI.BaseTexture} baseTexture
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.AbstractMultiResource} Instance for chaining
     */
    abstract addBaseTextureAt(baseTexture: BaseTexture, index: number): this;

    /**
     * Set a resource by ID
     *
     * @param {PIXI.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.ArrayResource} Instance for chaining
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
                const { realWidth, realHeight } = this.items[0];

                this.resize(realWidth, realHeight);

                return Promise.resolve(this);
            }
            );

        return this._load;
    }
}

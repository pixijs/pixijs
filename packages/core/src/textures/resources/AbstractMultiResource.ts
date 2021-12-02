import { Resource } from './Resource';
import { BaseTexture } from '../BaseTexture';
import { ISize } from '@pixi/math';
import { autoDetectResource, IAutoDetectOptions } from './autoDetectResource';

/**
 * Resource that can manage several resource (items) inside.
 * All resources need to have the same pixel size.
 * Parent class for CubeResource and ArrayResource
 *
 * @memberof PIXI
 */
export abstract class AbstractMultiResource extends Resource
{
    /** Number of elements in array. */
    readonly length: number;

    /**
     * Collection of partial baseTextures that correspond to resources.
     *
     * @readonly
     */
    items: Array<BaseTexture>;

    /**
     * Dirty IDs for each part.
     *
     * @readonly
     */
    itemDirtyIds: Array<number>;

    /**
     * Promise when loading.
     *
     * @default null
     */
    private _load: Promise<this>;

    /** Bound baseTexture, there can only be one. */
    baseTexture: BaseTexture;

    /**
     * @param length
     * @param options - Options to for Resource constructor
     * @param {number} [options.width] - Width of the resource
     * @param {number} [options.height] - Height of the resource
     */
    constructor(length: number, options?: ISize)
    {
        const { width, height } = options || {};

        super(width, height);

        this.items = [];
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

        this.length = length;
        this._load = null;
        this.baseTexture = null;
    }

    /**
     * Used from ArrayResource and CubeResource constructors.
     *
     * @param resources - Can be resources, image elements, canvas, etc. ,
     *  length should be same as constructor length
     * @param options - Detect options for resources
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

    /** Destroy this BaseImageResource. */
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
     * @param baseTexture
     * @param index - Zero-based index of resource to set
     * @return - Instance for chaining
     */
    abstract addBaseTextureAt(baseTexture: BaseTexture, index: number): this;

    /**
     * Set a resource by ID
     *
     * @param resource
     * @param index - Zero-based index of resource to set
     * @return - Instance for chaining
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

    /** Set the parent base texture. */
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

    /** Unset the parent base texture. */
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
     *
     * @return - When load is resolved
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

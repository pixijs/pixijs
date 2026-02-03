/**
 * A generic class for managing a pool of items.
 * @template T The type of items in the pool. Must implement {@link PoolItem}.
 * @template I The type of argument passed to item's `init` method if it exists.
 * @category utils
 * @advanced
 */
export class Pool<T extends PoolItem, I = Parameters<NonNullable<T['init']>>[0]>
{
    /** @internal */
    public readonly _classType: PoolItemConstructor<T>;
    private readonly _pool: T[] = [];
    private _count = 0;
    private _index = 0;

    /**
     * Constructs a new Pool.
     * @param ClassType - The constructor of the items in the pool.
     * @param {number} [initialSize] - The initial size of the pool.
     */
    constructor(ClassType: PoolItemConstructor<T>, initialSize?: number)
    {
        this._classType = ClassType;

        if (initialSize)
        {
            this.prepopulate(initialSize);
        }
    }

    /**
     * Prepopulates the pool with a given number of items.
     * @param total - The number of items to add to the pool.
     */
    public prepopulate(total: number): void
    {
        for (let i = 0; i < total; i++)
        {
            this._pool[this._index++] = new this._classType();
        }

        this._count += total;
    }

    /**
     * Gets an item from the pool. Calls the item's `init` method if it exists.
     * If there are no items left in the pool, a new one will be created.
     * @param {I} [data] - Optional data to pass to the item's constructor.
     * @returns {T} The item from the pool.
     */
    public get(data?: I): T
    {
        let item;

        if (this._index > 0)
        {
            item = this._pool[--this._index];
        }
        else
        {
            item = new this._classType();
            this._count++;
        }

        item.init?.(data);

        return item;
    }

    /**
     * Returns an item to the pool. Calls the item's `reset` method if it exists.
     * @param {T} item - The item to return to the pool.
     */
    public return(item: T): void
    {
        item.reset?.();

        this._pool[this._index++] = item;
    }

    /**
     * Gets the number of items in the pool.
     * @readonly
     */
    get totalSize(): number
    {
        return this._count;
    }

    /**
     * Gets the number of items in the pool that are free to use without needing to create more.
     * @readonly
     */
    get totalFree(): number
    {
        return this._index;
    }

    /**
     * Gets the number of items in the pool that are currently in use.
     * @readonly
     */
    get totalUsed(): number
    {
        return this._count - this._index;
    }

    /** clears the pool */
    public clear()
    {
        if (this._pool.length > 0 && this._pool[0].destroy)
        {
            for (let i = 0; i < this._index; i++)
            {
                this._pool[i].destroy();
            }
        }
        this._pool.length = 0;
        this._count = 0;
        this._index = 0;
    }
}

/**
 * An object that can be stored in a {@link Pool}.
 * @category utils
 * @advanced
 */
export type PoolItem = {
    init?: (data?: any) => void;
    reset?: () => void;
    destroy?: () => void;
    [key: string]: any;
};

/**
 * The constructor of an object that can be stored in a {@link Pool}.
 * @typeParam K - The type of the object that can be stored in a {@link Pool}.
 * @category utils
 * @advanced
 */
export type PoolItemConstructor<K extends PoolItem> = new () => K;

export class Pool<T extends PoolItem>
{
    public readonly _classType: PoolItemConstructor<T>;
    private readonly _pool: T[] = [];
    private _count = 0;
    private readonly _debug = false;

    constructor(ClassType: PoolItemConstructor<T>, initialSize?: number)
    {
        this._classType = ClassType;

        if (initialSize)
        {
            this.prepopulate(initialSize);
        }
    }

    public prepopulate(total: number): void
    {
        for (let i = 0; i < total; i++)
        {
            this._pool.push(new this._classType());
        }

        this._count += total;
    }

    public get(data?: unknown): T
    {
        let item = this._pool.pop();

        if (!item)
        {
            item = new this._classType();
        }

        item.init?.(data);

        return item;
    }

    public return(item: T): void
    {
        if (this._pool.indexOf(item) !== -1)
        {
            if (this._debug)console.warn('Object already in pool', item);

            return;
        }

        item.reset?.();

        this._pool.push(item);
    }

    get totalSize(): number
    {
        return this._count;
    }

    get totalFree(): number
    {
        return this._pool.length;
    }

    get totalUsed(): number
    {
        return this._count - this._pool.length;
    }
}

export type PoolItem = {
    init?: (data?: any) => void;
    reset?: () => void;
};

export type PoolItemConstructor<K extends PoolItem> = new () => K;

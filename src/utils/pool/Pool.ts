export class Pool<T extends PoolItem>
{
    public readonly _classType: PoolItemConstructor<T>;
    private readonly _pool: T[] = [];
    private _count = 0;
    private _nextAvailableIndex = 0;

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
        if (this._nextAvailableIndex >= this._count)
        {
            this._pool[this._count] = new this._classType();
            this._count++;
        }

        const item = this._pool[this._nextAvailableIndex];

        item.init?.(data);

        return item;
    }

    public return(item: T): void
    {
        item.reset?.();
        this._nextAvailableIndex--;
        this._pool[this._nextAvailableIndex] = item;
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

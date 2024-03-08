import { Pool } from './Pool';

import type { PoolItem, PoolItemConstructor } from './Pool';

/**
 * A type alias for a constructor of a Pool.
 * @template T The type of items in the pool. Must extend PoolItem.
 * @memberof utils
 */
export type PoolConstructor<T extends PoolItem> = new () => Pool<T>;

/**
 * A group of pools that can be used to store objects of different types.
 * @memberof utils
 */
export class PoolGroupClass
{
    /**
     * A map to store the pools by their class type.
     * @private
     */
    private readonly _poolsByClass: Map<PoolItemConstructor<PoolItem>, Pool<PoolItem>> = new Map();

    /**
     * Prepopulates a specific pool with a given number of items.
     * @template T The type of items in the pool. Must extend PoolItem.
     * @param {PoolItemConstructor<T>} Class - The constructor of the items in the pool.
     * @param {number} total - The number of items to add to the pool.
     */
    public prepopulate<T extends PoolItem>(Class: PoolItemConstructor<T>, total: number): void
    {
        const classPool = this.getPool(Class);

        classPool.prepopulate(total);
    }

    /**
     * Gets an item from a specific pool.
     * @template T The type of items in the pool. Must extend PoolItem.
     * @param {PoolItemConstructor<T>} Class - The constructor of the items in the pool.
     * @param {unknown} [data] - Optional data to pass to the item's constructor.
     * @returns {T} The item from the pool.
     */
    public get<T extends PoolItem>(Class: PoolItemConstructor<T>, data?: unknown): T
    {
        const pool = this.getPool(Class);

        return pool.get(data) as T;
    }

    /**
     * Returns an item to its respective pool.
     * @param {PoolItem} item - The item to return to the pool.
     */
    public return(item: PoolItem): void
    {
        const pool = this.getPool(item.constructor as PoolItemConstructor<PoolItem>);

        pool.return(item);
    }

    /**
     * Gets a specific pool based on the class type.
     * @template T The type of items in the pool. Must extend PoolItem.
     * @param {PoolItemConstructor<T>} ClassType - The constructor of the items in the pool.
     * @returns {Pool<T>} The pool of the given class type.
     */
    public getPool<T extends PoolItem>(ClassType: PoolItemConstructor<T>): Pool<T>
    {
        if (!this._poolsByClass.has(ClassType))
        {
            this._poolsByClass.set(ClassType, new Pool(ClassType));
        }

        return this._poolsByClass.get(ClassType) as Pool<T>;
    }

    /** gets the usage stats of each pool in the system */
    public stats(): Record<string, {free: number; used: number; size: number}>
    {
        const stats = {} as Record<string, {free: number; used: number; size: number}>;

        this._poolsByClass.forEach((pool) =>
        {
            // TODO: maybe we should allow the name to be set when `createEntity` is called
            const name = stats[pool._classType.name]
                ? pool._classType.name + (pool._classType as any).ID : pool._classType.name;

            stats[name] = {
                free: pool.totalFree,
                used: pool.totalUsed,
                size: pool.totalSize,
            };
        });

        return stats;
    }
}

export const BigPool = new PoolGroupClass();

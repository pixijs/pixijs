import { Pool } from './Pool';

import type { PoolItem, PoolItemConstructor } from './Pool';

export type PoolConstructor<T extends PoolItem> = new () => Pool<T>;

export class PoolGroupClass
{
    private readonly _poolsByClass: Map<PoolItemConstructor<unknown>, Pool<unknown>> = new Map();

    public prepopulate<T>(Class: PoolItemConstructor<T>, total: number): void
    {
        const classPool = this.getPool(Class);

        classPool.prepopulate(total);
    }

    public get<T>(Class: PoolItemConstructor<T>, data?: unknown): T
    {
        const pool = this.getPool(Class);

        return pool.get(data) as T;
    }

    public return(item: PoolItem): void
    {
        const pool = this.getPool(item.constructor as PoolItemConstructor<PoolItem>);

        pool.return(item);
    }

    public getPool<T>(ClassType: PoolItemConstructor<T>): Pool<T>
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

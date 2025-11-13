import { Pool } from '../Pool';

class TestItem
{
    public value: number;

    constructor()
    {
        this.value = 0;
    }

    public init(data?: unknown)
    {
        this.value = data as number || 0;
    }

    public reset()
    {
        this.value = 0;
    }
}

describe('Pool', () =>
{
    it('should create a pool with the specified initial size', () =>
    {
        const pool = new Pool(TestItem, 5);

        expect(pool['_count']).toBe(5);
        expect(pool['_pool']).toHaveLength(5);
    });

    it('should create a pool with no initial size', () =>
    {
        const pool = new Pool(TestItem);

        expect(pool['_count']).toBe(0);
        expect(pool['_pool']).toHaveLength(0);
    });

    it('should prepopulate the pool with the specified number of items', () =>
    {
        const pool = new Pool(TestItem);

        pool.prepopulate(5);

        expect(pool['_count']).toBe(5);
        expect(pool['_pool']).toHaveLength(5);
    });

    it('should get an item from the pool', () =>
    {
        const pool = new Pool(TestItem);
        const item = pool.get(10);

        expect(item.value).toBe(10);
    });

    it('should return an item to the pool', () =>
    {
        const pool = new Pool(TestItem);
        const item = pool.get(10);

        pool.return(item);

        expect(item.value).toBe(0);
    });

    it('should reuse returned items', () =>
    {
        const pool = new Pool(TestItem);
        const item1 = pool.get(10);

        pool.get(20);

        pool.return(item1);
        const item3 = pool.get(30);

        expect(item3).toBe(item1);
    });

    it('should track the count of items in the pool', () =>
    {
        const pool = new Pool(TestItem);

        expect(pool.totalSize).toBe(0);
        expect(pool.totalFree).toBe(0);
        expect(pool.totalUsed).toBe(0);

        pool.prepopulate(3);

        expect(pool.totalSize).toBe(3);
        expect(pool.totalFree).toBe(3);
        expect(pool.totalUsed).toBe(0);

        const item1 = pool.get();

        pool.get();

        expect(pool.totalSize).toBe(3);
        expect(pool.totalFree).toBe(1);
        expect(pool.totalUsed).toBe(2);

        pool.return(item1);

        expect(pool.totalSize).toBe(3);
        expect(pool.totalFree).toBe(2);
        expect(pool.totalUsed).toBe(1);
    });

    it('should call destroy on available items with a destroy method', () =>
    {
        class DestroyableItem
        {
            public destroy = jest.fn();
        }

        const pool = new Pool(DestroyableItem);

        pool.prepopulate(2);

        const pooledItems = [...pool['_pool']];

        pool.clear();

        expect(pool.totalSize).toBe(0);
        pooledItems.forEach((item) =>
        {
            expect(item.destroy).toHaveBeenCalledTimes(1);
        });
    });

    it('should reset storage and counters', () =>
    {
        const pool = new Pool(TestItem, 3);

        pool.get(5);

        pool.clear();

        expect(pool['_pool']).toHaveLength(0);
        expect(pool.totalSize).toBe(0);
        expect(pool.totalFree).toBe(0);
        expect(pool.totalUsed).toBe(0);
    });
});

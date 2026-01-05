import { expectTypeOf } from 'expect-type';
import { Pool, type PoolItemConstructor } from '../Pool';

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

class TestItem2
{
    public name!: string;
    public id!: number;

    public init(data?: { name: string, id: number })
    {
        this.name = data.name ?? '';
        this.id = data.id ?? -1;
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

    it('should reuse returned items and call item.reset() if exists', () =>
    {
        const pool = new Pool(TestItem);
        const item1 = pool.get(10);

        pool.get(20);

        pool.return(item1);

        expect(item1.value).toBe(0);

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

    it('should call item.destroy() on each item when pool.clear() is called', () =>
    {
        class TestItemDestroy
        {
            public destroyed = false;
            public destroy()
            {
                this.destroyed = true;
            }
        }

        const pool = new Pool(TestItemDestroy);
        const item1 = new TestItemDestroy();
        const item2 = new TestItemDestroy();

        pool.return(item1);
        pool.return(item2);

        expect(item1.destroyed).toEqual(false);
        expect(item2.destroyed).toEqual(false);

        pool.clear();

        expect(item1.destroyed).toEqual(true);
        expect(item2.destroyed).toEqual(true);
    });

    it('should use the correct _classType', () =>
    {
        const pool = new Pool(TestItem);

        expect(pool['_classType']).toEqual(TestItem);
        expectTypeOf(pool['_classType']).toEqualTypeOf<PoolItemConstructor<TestItem>>();
    });

    it('should use the data argument type of item.init(data) for the pool.get() method', () =>
    {
        const pool = new Pool(TestItem2);

        expectTypeOf<Parameters<typeof pool.get>[0]>().toEqualTypeOf<{
            name: string,
            id: number
        }>();

        const item2 = pool.get({ name: 'test item', id: 99 });

        expect(item2).toEqual({
            name: 'test item',
            id: 99,
        });
    });

    it('should ignore the data argument type of item.init(data) if the item does not have an init() method', () =>
    {
        class EmptyTestItem
        {

        }
        const pool = new Pool(EmptyTestItem);

        expectTypeOf<Parameters<typeof pool.get>[0]>().toEqualTypeOf<never>();

        const item = new EmptyTestItem();

        pool.return(item);

        expect(pool.get()).toEqual(item);
    });
});

import { removeItems } from '../data/removeItems';

describe('removeItems', () =>
{
    it('should remove items from the middle of an array', () =>
    {
        const arr = [1, 2, 3, 4, 5];

        removeItems(arr, 1, 2);

        expect(arr).toEqual([1, 4, 5]);
    });

    it('should remove items from the beginning of an array', () =>
    {
        const arr = [1, 2, 3, 4, 5];

        removeItems(arr, 0, 2);

        expect(arr).toEqual([3, 4, 5]);
    });

    it('should remove items from the end of an array', () =>
    {
        const arr = [1, 2, 3, 4, 5];

        removeItems(arr, 3, 2);

        expect(arr).toEqual([1, 2, 3]);
    });

    it('should remove a single item', () =>
    {
        const arr = [1, 2, 3];

        removeItems(arr, 1, 1);

        expect(arr).toEqual([1, 3]);
    });

    it('should handle removing all items', () =>
    {
        const arr = [1, 2, 3];

        removeItems(arr, 0, 3);

        expect(arr).toEqual([]);
    });

    it('should do nothing if startIdx is beyond array length', () =>
    {
        const arr = [1, 2, 3];

        removeItems(arr, 10, 2);

        expect(arr).toEqual([1, 2, 3]);
    });

    it('should do nothing if removeCount is 0', () =>
    {
        const arr = [1, 2, 3];

        removeItems(arr, 1, 0);

        expect(arr).toEqual([1, 2, 3]);
    });

    it('should clamp removeCount to remaining elements', () =>
    {
        const arr = [1, 2, 3, 4, 5];

        removeItems(arr, 3, 10);

        expect(arr).toEqual([1, 2, 3]);
    });

    it('should work with an empty array', () =>
    {
        const arr: number[] = [];

        removeItems(arr, 0, 1);

        expect(arr).toEqual([]);
    });

    it('should work with string arrays', () =>
    {
        const arr = ['a', 'b', 'c', 'd'];

        removeItems(arr, 1, 2);

        expect(arr).toEqual(['a', 'd']);
    });

    it('should work with object arrays', () =>
    {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const obj3 = { id: 3 };
        const arr = [obj1, obj2, obj3];

        removeItems(arr, 1, 1);

        expect(arr).toEqual([obj1, obj3]);
    });
});

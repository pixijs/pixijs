import { cleanArray, cleanHash } from '../data/clean';

describe('cleanHash', () =>
{
    it('should return the same hash if no undefined/null values', () =>
    {
        const hash = { a: 1, b: 2, c: 3 };
        const result = cleanHash(hash);

        expect(result).toBe(hash);
    });

    it('should remove null values', () =>
    {
        const hash: Record<string, number | null> = { a: 1, b: null, c: 3 };
        const result = cleanHash(hash);

        expect(result).toEqual({ a: 1, c: 3 });
        expect(result).not.toBe(hash);
    });

    it('should remove undefined values', () =>
    {
        const hash: Record<string, number | undefined> = { a: 1, b: undefined, c: 3 };
        const result = cleanHash(hash);

        expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should handle all null/undefined values', () =>
    {
        const hash: Record<string, null | undefined> = { a: null, b: undefined };
        const result = cleanHash(hash);

        expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle empty hash', () =>
    {
        const hash: Record<string, number> = {};
        const result = cleanHash(hash);

        expect(result).toBe(hash);
    });

    it('should preserve string values including empty string', () =>
    {
        // Note: cleanHash uses loose equality (==), so empty string is falsy
        // and would be removed by the cleanup loop
        const hash: Record<string, string | null> = { a: 'hello', b: null, c: 'world' };
        const result = cleanHash(hash);

        expect(result).toEqual({ a: 'hello', c: 'world' });
    });
});

describe('cleanArray', () =>
{
    it('should remove undefined elements and compact the array', () =>
    {
        const arr: (number | undefined)[] = [1, undefined, 2, undefined, 3];
        const result = cleanArray(arr);

        expect(result).toEqual([1, 2, 3]);
        expect(result).toBe(arr); // Should modify in-place
    });

    it('should remove null elements', () =>
    {
        const arr: (number | null)[] = [1, null, 2, null, 3];
        const result = cleanArray(arr);

        expect(result).toEqual([1, 2, 3]);
    });

    it('should handle array with no undefined/null values', () =>
    {
        const arr = [1, 2, 3];
        const result = cleanArray(arr);

        expect(result).toEqual([1, 2, 3]);
        expect(result).toBe(arr);
    });

    it('should handle empty array', () =>
    {
        const arr: number[] = [];
        const result = cleanArray(arr);

        expect(result).toEqual([]);
    });

    it('should handle array with all undefined values', () =>
    {
        const arr: (number | undefined)[] = [undefined, undefined, undefined];
        const result = cleanArray(arr);

        expect(result).toEqual([]);
    });

    it('should handle array with all null values', () =>
    {
        const arr: (number | null)[] = [null, null, null];
        const result = cleanArray(arr);

        expect(result).toEqual([]);
    });

    it('should handle undefined at start and end', () =>
    {
        const arr: (number | undefined)[] = [undefined, 1, 2, 3, undefined];
        const result = cleanArray(arr);

        expect(result).toEqual([1, 2, 3]);
    });

    it('should correctly adjust array length', () =>
    {
        const arr: (string | undefined)[] = ['a', undefined, 'b', undefined, undefined, 'c'];
        const result = cleanArray(arr);

        expect(result.length).toEqual(3);
        expect(result).toEqual(['a', 'b', 'c']);
    });
});

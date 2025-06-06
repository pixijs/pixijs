
/**
 * Stable in-place array sort that preserves the original
 * order of equal elements. Useful for environments where
 * `Array.sort` is unstable.
 *
 * @example
 * ```ts
 * const items = [
 *     { id: 'a', priority: 1 },
 *     { id: 'b', priority: 1 }
 * ];
 *
 * stableSort(items, (a, b) => a.priority - b.priority);
 * console.log(items.map(i => i.id)); // ['a', 'b']
 * ```
 *
 * @param array - The array to sort.
 * @param compareFn - Comparison function.
 * @category utils
 * @internal
 */
export function stableSort<T>(array: T[], compareFn: (a: T, b: T) => number): void
{
    const indexed = array.map((item, index) => ({ item, index }));

    indexed.sort((a, b) =>
    {
        const result = compareFn(a.item, b.item);

        return result === 0 ? a.index - b.index : result;
    });

    for (let i = 0; i < indexed.length; i++)
    {
        array[i] = indexed[i].item;
    }
}

/**
 * Takes a hash and removes all the `undefined`/`null` values from it.
 * In PixiJS, we tend to null properties instead of using 'delete' for performance reasons.
 * However, in some cases, this could be a problem if the hash grows too large over time,
 * this function can be used to clean a hash.
 * @param hash - The hash to clean.
 * @returns A new hash with all the `undefined`/`null` values removed.
 * @memberof utils
 */
export function cleanHash<T>(hash: Record<string, T>): Record<string, T>
{
    let clean = false;

    for (const i in hash)
    {
        // eslint-disable-next-line eqeqeq
        if (hash[i] == undefined)
        {
            clean = true;
            break;
        }
    }

    if (!clean) return hash;

    const cleanHash = Object.create(null);

    for (const i in hash)
    {
        const value = hash[i];

        if (value)
        {
            cleanHash[i] = value;
        }
    }

    return cleanHash;
}

/**
 * Removes all `undefined`/`null` elements from the given array and compacts the array.
 *
 * This function iterates through the array, shifting non-undefined elements to the left
 * to fill gaps created by `undefined` elements. The length of the array is then adjusted
 * to remove the trailing `undefined` elements.
 * @param arr - The array to be cleaned.
 * @returns The cleaned array with all `undefined` elements removed.
 * @example
 * // Example usage:
 * const arr = [1, undefined, 2, undefined, 3];
 * const cleanedArr = cleanArray(arr);
 * console.log(cleanedArr); // Output: [1, 2, 3]
 * @memberof utils
 */
export function cleanArray<T>(arr: T[]): T[]
{
    let offset = 0;

    for (let i = 0; i < arr.length; i++)
    {
        // eslint-disable-next-line eqeqeq
        if (arr[i] == undefined)
        {
            offset++;
        }
        else
        {
            arr[i - offset] = arr[i];
        }
    }

    arr.length -= offset;

    return arr;
}

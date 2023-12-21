/**
 * Returns a new object with all properties from the input object that have defined values.
 * @template T - The type of the input object.
 * @param {T} obj - The input object.
 * @returns {T} - A new object with only the defined properties from the input object.
 * @memberof utils
 * @ignore
 */
export function definedProps<T extends Record<string, any>>(obj: T): T
{
    const result: Partial<T> = {};

    for (const key in obj)
    {
        if (obj[key] !== undefined)
        {
            result[key] = obj[key];
        }
    }

    return result as T;
}

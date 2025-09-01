/**
 * Recursively remove all undefined/null values from an object or array.
 * @param value - The value to clean
 * @param depth - Maximum recursion depth. If 0, no recursion is performed. Defaults to Infinity for unlimited depth.
 * @returns The cleaned value
 * @internal
 */
export function deepRemoveUndefinedOrNull<T>(value: T, depth: number = Infinity): T
{
    if (depth === 0) return value;

    if (Array.isArray(value))
    {
        // Iterate backwards so we can safely splice while iterating
        for (let i = value.length - 1; i >= 0; i--)
        {
            const item = value[i];

            if (item === undefined || item === null)
            {
                value.splice(i, 1);
            }
            else
            {
                deepRemoveUndefinedOrNull(item, depth - 1);
            }
        }

        return value;
    }

    if (value && typeof value === 'object')
    {
        for (const key of Object.keys(value as object))
        {
            const val = (value as Record<string, unknown>)[key];

            if (val === undefined || val === null)
            {
                delete (value as Record<string, unknown>)[key];
            }
            else
            {
                deepRemoveUndefinedOrNull(val, depth - 1);
            }
        }

        return value;
    }

    // Primitives are returned as-is
    return value;
}

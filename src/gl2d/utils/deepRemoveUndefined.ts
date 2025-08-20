/**
 * Recursively remove all undefined values from an object or array.
 * @param value - The value to clean
 * @returns The cleaned value
 * @internal
 */
export function deepRemoveUndefined<T>(value: T): T
{
    if (Array.isArray(value))
    {
    // Iterate backwards so we can safely splice while iterating
        for (let i = value.length - 1; i >= 0; i--)
        {
            const item = value[i];

            if (item === undefined)
            {
                value.splice(i, 1);
            }
            else
            {
                deepRemoveUndefined(item);
            }
        }

        return value;
    }

    if (value && typeof value === 'object')
    {
        for (const key of Object.keys(value as object))
        {
            const val = (value as Record<string, unknown>)[key];

            if (val === undefined)
            {
                delete (value as Record<string, unknown>)[key];
            }
            else
            {
                deepRemoveUndefined(val);
            }
        }

        return value;
    }

    // Primitives are returned as-is
    return value;
}

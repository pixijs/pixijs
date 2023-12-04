/**
 * Assigns properties from one object to another, using an optional array of property names to ignore.
 * @param target - The target object to assign properties to.
 * @param options - The object to assign properties from.
 * @param ignore - An object of property names to ignore ({ propToIgnore: true }).
 */
export function assignWithIgnore<T extends Record<string, any>>(
    target: T,
    options: T,
    ignore: Record<string, boolean> = {}
)
{
    for (const key in options)
    {
        if (!ignore[key] && options[key] !== undefined)
        {
            target[key] = options[key];
        }
    }
}

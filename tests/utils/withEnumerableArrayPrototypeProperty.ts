/**
 * Runs a callback while `Array.prototype` has an enumerable property, the way a script or polyfill
 * on the page can leave it. The property is removed once the callback's result settles.
 * @param run - The code to run.
 */
export async function withEnumerableArrayPrototypeProperty<T>(run: () => T | Promise<T>): Promise<T>
{
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'inherited', { value: true, enumerable: true, configurable: true });

    try
    {
        return await run();
    }
    finally
    {
        Reflect.deleteProperty(Array.prototype, 'inherited');
    }
}

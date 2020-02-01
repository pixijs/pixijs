// Cache the result to prevent running this over and over
let unsafeEval: boolean;

/**
 * Not all platforms allow to generate function code (e.g., `new Function`).
 * this provides the platform-level detection.
 *
 * @private
 * @returns {boolean}
 */
export function unsafeEvalSupported(): boolean
{
    if (typeof unsafeEval === 'boolean')
    {
        return unsafeEval;
    }

    try
    {
        /* eslint-disable no-new-func */
        const func = new Function('param1', 'param2', 'param3', 'return param1[param2] === param3;');
        /* eslint-enable no-new-func */

        unsafeEval = func({ a: 'b' }, 'a', 'b') === true;
    }
    catch (e)
    {
        unsafeEval = false;
    }

    return unsafeEval;
}

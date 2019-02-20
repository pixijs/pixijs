/**
 * Not all platforms allow to generate function code
 *
 * @private
 * @returns {boolean}
 */
export default function canGenerateNewFunction()
{
    try
    {
        /* eslint-disable no-new-func */
        const func = new Function('param1', 'param2', 'param3', 'return param1[param2] === param3;');
        /* eslint-enable no-new-func */

        return func({ a: 'b' }, 'a', 'b') === true;
    }
    catch (e)
    {
        return false;
    }
}

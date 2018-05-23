// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

if (!Number.isInteger)
{
    Number.isInteger = function numberIsInteger(value)
    {
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
}

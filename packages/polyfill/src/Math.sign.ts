// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

if (!Math.sign)
{
    Math.sign = function mathSign(x): number
    {
        x = Number(x);

        if (x === 0 || isNaN(x))
        {
            return x;
        }

        return x > 0 ? 1 : -1;
    };
}

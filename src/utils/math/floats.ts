/**
 * Quickly rounds (with relatively decent precision) a number. ref: https://stackoverflow.com/a/48764436
 * @param num
 * @param decimalPlaces
 */
export function quickRound(num: number, decimalPlaces: number): number
{
    const p = Math.pow(10, decimalPlaces || 0);
    const n = (num * p) * (1 + Number.EPSILON);

    return Math.round(n) / p;
}

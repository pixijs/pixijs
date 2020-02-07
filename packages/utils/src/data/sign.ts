/**
 * Returns sign of number
 *
 * @memberof PIXI.utils
 * @function sign
 * @param {number} n - the number to check the sign of
 * @returns {number} 0 if `n` is 0, -1 if `n` is negative, 1 if `n` is positive
 */
export function sign(n: number): -1|0|1
{
    if (n === 0) return 0;

    return n < 0 ? -1 : 1;
}

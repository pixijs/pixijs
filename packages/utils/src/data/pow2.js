// Taken from the bit-twiddle package

/**
 * Rounds to next power of two.
 *
 * @function isPow2
 * @memberof PIXI.utils
 * @param {number} value
 * @return {number}
 */
export function nextPow2(v)
{
    v += v === 0;
    --v;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;

    return v + 1;
}

/**
 * Checks if a number is a power of two.
 *
 * @function isPow2
 * @memberof PIXI.utils
 * @param {number} value
 * @param {boolean} `true` if value is power of two
 */
export function isPow2(v)
{
    return !(v & (v - 1)) && (!!v);
}

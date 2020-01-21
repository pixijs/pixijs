// Taken from the bit-twiddle package

/**
 * Rounds to next power of two.
 *
 * @function nextPow2
 * @memberof PIXI.utils
 * @param {number} v input value
 * @return {number}
 */
export function nextPow2(v: number): number
{
    v += v === 0 ? 1 : 0;
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
 * @param {number} v input value
 * @return {boolean} `true` if value is power of two
 */
export function isPow2(v: number): boolean
{
    return !(v & (v - 1)) && (!!v);
}

/**
 * Computes ceil of log base 2
 *
 * @function log2
 * @memberof PIXI.utils
 * @param {number} v input value
 * @return {number} logarithm base 2
 */
export function log2(v: number): number
{
    let r = (v > 0xFFFF ? 1 : 0) << 4;

    v >>>= r;

    let shift = (v > 0xFF ? 1 : 0) << 3;

    v >>>= shift; r |= shift;
    shift = (v > 0xF ? 1 : 0) << 2;
    v >>>= shift; r |= shift;
    shift = (v > 0x3 ? 1 : 0) << 1;
    v >>>= shift; r |= shift;

    return r | (v >> 1);
}

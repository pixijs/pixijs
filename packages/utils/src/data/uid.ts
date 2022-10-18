let nextUid = 0;

/**
 * Gets the next unique identifier
 * @memberof PIXI.utils
 * @function uid
 * @returns {number} The next unique identifier to use.
 */
export function uid(): number
{
    return ++nextUid;
}

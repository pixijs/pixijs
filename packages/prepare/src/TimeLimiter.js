/**
 * TimeLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of milliseconds per frame.
 *
 * @class
 * @memberof PIXI
 */
export default class TimeLimiter
{
    /**
     * @param {number} maxMilliseconds - The maximum milliseconds that can be spent preparing items each frame.
     */
    constructor(maxMilliseconds)
    {
        /**
         * The maximum milliseconds that can be spent preparing items each frame.
         * @private
         */
        this.maxMilliseconds = maxMilliseconds;
        /**
         * The start time of the current frame.
         * @type {number}
         * @private
         */
        this.frameStart = 0;
    }

    /**
     * Resets any counting properties to start fresh on a new frame.
     */
    beginFrame()
    {
        this.frameStart = Date.now();
    }

    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    allowedToUpload()
    {
        return Date.now() - this.frameStart < this.maxMilliseconds;
    }
}

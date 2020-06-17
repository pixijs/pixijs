/**
 * TimeLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of milliseconds per frame.
 *
 * @class
 * @memberof PIXI
 */
export class TimeLimiter
{
    public maxMilliseconds: number;
    public frameStart: number;
    /**
     * @param {number} maxMilliseconds - The maximum milliseconds that can be spent preparing items each frame.
     */
    constructor(maxMilliseconds: number)
    {
        /**
         * The maximum milliseconds that can be spent preparing items each frame.
         * @type {number}
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
    beginFrame(): void
    {
        this.frameStart = Date.now();
    }

    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    allowedToUpload(): boolean
    {
        return Date.now() - this.frameStart < this.maxMilliseconds;
    }
}

/**
 * CountLimiter limits the number of items handled by a {@link PIXI.prepare.BasePrepare} to a specified
 * number of items per frame.
 *
 * @class
 * @memberof PIXI
 */
export default class CountLimiter
{
    /**
     * @param {number} maxItemsPerFrame - The maximum number of items that can be prepared each frame.
     */
    constructor(maxItemsPerFrame)
    {
        /**
         * The maximum number of items that can be prepared each frame.
         * @private
         */
        this.maxItemsPerFrame = maxItemsPerFrame;
        /**
         * The number of items that can be prepared in the current frame.
         * @type {number}
         * @private
         */
        this.itemsLeft = 0;
    }

    /**
     * Resets any counting properties to start fresh on a new frame.
     */
    beginFrame()
    {
        this.itemsLeft = this.maxItemsPerFrame;
    }

    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    allowedToUpload()
    {
        return this.itemsLeft-- > 0;
    }
}

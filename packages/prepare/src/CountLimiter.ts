/**
 * CountLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of items per frame.
 * @memberof PIXI
 */
export class CountLimiter
{
    /** The maximum number of items that can be prepared each frame. */
    public maxItemsPerFrame: number;

    /** The number of items that can be prepared in the current frame. */
    public itemsLeft: number;

    /**
     * @param maxItemsPerFrame - The maximum number of items that can be prepared each frame.
     */
    constructor(maxItemsPerFrame: number)
    {
        this.maxItemsPerFrame = maxItemsPerFrame;
        this.itemsLeft = 0;
    }

    /** Resets any counting properties to start fresh on a new frame. */
    beginFrame(): void
    {
        this.itemsLeft = this.maxItemsPerFrame;
    }

    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @returns If the item is allowed to be uploaded.
     */
    allowedToUpload(): boolean
    {
        return this.itemsLeft-- > 0;
    }
}

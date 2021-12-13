/**
 * TimeLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of milliseconds per frame.
 *
 * @memberof PIXI
 */
export class TimeLimiter
{
    /** The maximum milliseconds that can be spent preparing items each frame. */
    public maxMilliseconds: number;

    /**
     * The start time of the current frame.
     *
     * @readonly
     */
    public frameStart: number;

    /** @param maxMilliseconds - The maximum milliseconds that can be spent preparing items each frame. */
    constructor(maxMilliseconds: number)
    {
        this.maxMilliseconds = maxMilliseconds;
        this.frameStart = 0;
    }

    /** Resets any counting properties to start fresh on a new frame. */
    beginFrame(): void
    {
        this.frameStart = Date.now();
    }

    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     *
     * @return - If the item is allowed to be uploaded.
     */
    allowedToUpload(): boolean
    {
        return Date.now() - this.frameStart < this.maxMilliseconds;
    }
}

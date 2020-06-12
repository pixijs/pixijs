export interface InteractionTrackingFlags
{
    OVER: number;
    LEFT_DOWN: number;
    RIGHT_DOWN: number;
    NONE: number;
}

/**
 * DisplayObjects with the {@link PIXI.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI
 */
export class InteractionTrackingData
{
    public static FLAGS: Readonly<InteractionTrackingFlags> = Object.freeze({
        NONE: 0,
        OVER: 1 << 0,
        LEFT_DOWN: 1 << 1,
        RIGHT_DOWN: 1 << 2,
    });

    private readonly _pointerId: number;
    private _flags: number;

    /**
     * @param {number} pointerId - Unique pointer id of the event
     * @private
     */
    constructor(pointerId: number)
    {
        this._pointerId = pointerId;
        this._flags = InteractionTrackingData.FLAGS.NONE;
    }

    /**
     *
     * @private
     * @param {number} flag - The interaction flag to set
     * @param {boolean} yn - Should the flag be set or unset
     */
    private _doSet(flag: number, yn: boolean): void
    {
        if (yn)
        {
            this._flags = this._flags | flag;
        }
        else
        {
            this._flags = this._flags & (~flag);
        }
    }

    /**
     * Unique pointer id of the event
     *
     * @readonly
     * @private
     * @member {number}
     */
    get pointerId(): number
    {
        return this._pointerId;
    }

    /**
     * State of the tracking data, expressed as bit flags
     *
     * @private
     * @member {number}
     */
    get flags(): number
    {
        return this._flags;
    }

    set flags(flags: number)
    {
        this._flags = flags;
    }

    /**
     * Is the tracked event inactive (not over or down)?
     *
     * @private
     * @member {number}
     */
    get none(): boolean
    {
        return this._flags === InteractionTrackingData.FLAGS.NONE;
    }

    /**
     * Is the tracked event over the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get over(): boolean
    {
        return (this._flags & InteractionTrackingData.FLAGS.OVER) !== 0;
    }

    set over(yn: boolean)
    {
        this._doSet(InteractionTrackingData.FLAGS.OVER, yn);
    }

    /**
     * Did the right mouse button come down in the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get rightDown(): boolean
    {
        return (this._flags & InteractionTrackingData.FLAGS.RIGHT_DOWN) !== 0;
    }

    set rightDown(yn: boolean)
    {
        this._doSet(InteractionTrackingData.FLAGS.RIGHT_DOWN, yn);
    }

    /**
     * Did the left mouse button come down in the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get leftDown(): boolean
    {
        return (this._flags & InteractionTrackingData.FLAGS.LEFT_DOWN) !== 0;
    }

    set leftDown(yn: boolean)
    {
        this._doSet(InteractionTrackingData.FLAGS.LEFT_DOWN, yn);
    }
}

/**
 * DisplayObjects with the {@link PIXI.interaction.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI.interaction
 */
export class InteractionTrackingData
{
    /**
     * @param {number} pointerId - Unique pointer id of the event
     * @private
     */
    constructor(pointerId)
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
    _doSet(flag, yn)
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
    get pointerId()
    {
        return this._pointerId;
    }

    /**
     * State of the tracking data, expressed as bit flags
     *
     * @private
     * @member {number}
     */
    get flags()
    {
        return this._flags;
    }

    set flags(flags) // eslint-disable-line require-jsdoc
    {
        this._flags = flags;
    }

    /**
     * Is the tracked event inactive (not over or down)?
     *
     * @private
     * @member {number}
     */
    get none()
    {
        return this._flags === this.constructor.FLAGS.NONE;
    }

    /**
     * Is the tracked event over the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get over()
    {
        return (this._flags & this.constructor.FLAGS.OVER) !== 0;
    }

    set over(yn) // eslint-disable-line require-jsdoc
    {
        this._doSet(this.constructor.FLAGS.OVER, yn);
    }

    /**
     * Did the right mouse button come down in the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get rightDown()
    {
        return (this._flags & this.constructor.FLAGS.RIGHT_DOWN) !== 0;
    }

    set rightDown(yn) // eslint-disable-line require-jsdoc
    {
        this._doSet(this.constructor.FLAGS.RIGHT_DOWN, yn);
    }

    /**
     * Did the left mouse button come down in the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get leftDown()
    {
        return (this._flags & this.constructor.FLAGS.LEFT_DOWN) !== 0;
    }

    set leftDown(yn) // eslint-disable-line require-jsdoc
    {
        this._doSet(this.constructor.FLAGS.LEFT_DOWN, yn);
    }
}

InteractionTrackingData.FLAGS = Object.freeze({
    NONE: 0,
    OVER: 1 << 0,
    LEFT_DOWN: 1 << 1,
    RIGHT_DOWN: 1 << 2,
});

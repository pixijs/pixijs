/**
 * Interface for classes that represent a hit area.
 *
 * It is implemented by the following classes:
 * - {@link PIXI.Circle}
 * - {@link PIXI.Ellipse}
 * - {@link PIXI.Polygon}
 * - {@link PIXI.RoundedRectangle}
 *
 * @interface IHitArea
 * @memberof PIXI
 */

/**
 * Checks whether the x and y coordinates given are contained within this area
 *
 * @method
 * @name contains
 * @memberof PIXI.IHitArea#
 * @param {number} x - The X coordinate of the point to test
 * @param {number} y - The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this area
 */

/**
 * Default property values of interactive objects
 * Used by {@link PIXI.interaction.InteractionManager} to automatically give all DisplayObjects these properties
 *
 * @private
 * @name interactiveTarget
 * @type {Object}
 * @memberof PIXI.interaction
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          DisplayObject.prototype,
 *          PIXI.interaction.interactiveTarget
 *      );
 */
export const interactiveTarget = {

    /**
     * Enable interaction events for the DisplayObject. Touch, pointer and mouse
     * events will not be emitted unless `interactive` is set to `true`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.on('tap', (event) => {
     *    //handle event
     * });
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    interactive: false,

    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     *
     * @member {boolean}
     * @memberof PIXI.Container#
     */
    interactiveChildren: true,

    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
     * @member {PIXI.IHitArea}
     * @memberof PIXI.DisplayObject#
     */
    hitArea: null,

    /**
     * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
     * Setting this changes the 'cursor' property to `'pointer'`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.buttonMode = true;
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    get buttonMode()
    {
        return this.cursor === 'pointer';
    },
    set buttonMode(value)
    {
        if (value)
        {
            this.cursor = 'pointer';
        }
        else if (this.cursor === 'pointer')
        {
            this.cursor = null;
        }
    },

    /**
     * This defines what cursor mode is used when the mouse cursor
     * is hovered over the displayObject.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.cursor = 'wait';
     * @see https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    cursor: null,

    /**
     * Internal set of all active pointers, by identifier
     *
     * @member {Map<number, InteractionTrackingData>}
     * @memberof PIXI.DisplayObject#
     * @private
     */
    get trackedPointers()
    {
        if (this._trackedPointers === undefined) this._trackedPointers = {};

        return this._trackedPointers;
    },

    /**
     * Map of all tracked pointers, by identifier. Use trackedPointers to access.
     *
     * @private
     * @type {Map<number, InteractionTrackingData>}
     */
    _trackedPointers: undefined,
};

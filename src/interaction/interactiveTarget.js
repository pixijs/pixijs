/**
 * Default property values of interactive objects
 * Used by {@link PIXI.interaction.InteractionManager} to automatically give all DisplayObjects these properties
 *
 * @mixin
 * @name interactiveTarget
 * @memberof PIXI.interaction
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          core.DisplayObject.prototype,
 *          PIXI.interaction.interactiveTarget
 *      );
 */
export default {
    /**
     * @see PIXI.interaction.interactiveTarget#interactive
     * @name PIXI.DisplayObject#interactive
     * @type {boolean}
     * @default false
     */

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
     * @memberof PIXI.interaction.interactiveTarget#
     */
    interactive: false,

    /**
     * @see PIXI.interaction.interactiveTarget#interactiveChildren
     * @name PIXI.Container#interactiveChildren
     * @type {boolean}
     * @default false
     */

    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows pixi to bypass a recursive hitTest function
     *
     * @member {boolean}
     * @memberof PIXI.interaction.interactiveTarget#
     */
    interactiveChildren: true,

    /**
     * @see PIXI.interaction.interactiveTarget#hitArea
     * @name PIXI.DisplayObject#hitArea
     * @type {PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle}
     */

    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
     * @member {PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle}
     * @memberof PIXI.interaction.interactiveTarget#
     */
    hitArea: null,

    /**
     * @see PIXI.interaction.interactiveTarget#buttonMode
     * @name PIXI.DisplayObject#buttonMode
     * @type {boolean}
     */

    /**
     * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
     * Setting this changes the 'cursor' property to `'pointer'`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.buttonMode = true;
     * @member {boolean}
     * @memberof PIXI.interaction.interactiveTarget#
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
     * @see PIXI.interaction.interactiveTarget#cursor
     * @name PIXI.DisplayObject#cursor
     * @type {string}
     */

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
     * @memberof PIXI.interaction.interactiveTarget#
     */
    cursor: null,

    /**
     * @see PIXI.interaction.interactiveTarget#trackedPointers
     * @name PIXI.DisplayObject#trackedPointers
     * @type {Map<number, InteractionTrackingData>}
     */

    /**
     * Internal set of all active pointers, by identifier
     *
     * @member {Map<number, InteractionTrackingData>}
     * @memberof PIXI.interaction.interactiveTarget#
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

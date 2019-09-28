/**
 * Default property values of accessible objects
 * used by {@link PIXI.accessibility.AccessibilityManager}.
 *
 * @private
 * @function accessibleTarget
 * @memberof PIXI.accessibility
 * @type {Object}
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.accessibility.accessibleTarget
 *      );
 */
export const accessibleTarget = {
    /**
     *  Flag for if the object is accessible. If true AccessibilityManager will overlay a
     *   shadow div with attributes set
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    accessible: false,

    /**
     * Sets the title attribute of the shadow div
     * If accessibleTitle AND accessibleHint has not been this will default to 'displayObject [tabIndex]'
     *
     * @member {?string}
     * @memberof PIXI.DisplayObject#
     */
    accessibleTitle: null,

    /**
     * Sets the aria-label attribute of the shadow div
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    accessibleHint: null,

    /**
     * @member {number}
     * @memberof PIXI.DisplayObject#
     * @private
     * @todo Needs docs.
     */
    tabIndex: 0,

    /**
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @todo Needs docs.
     */
    _accessibleActive: false,

    /**
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @todo Needs docs.
     */
    _accessibleDiv: false,

    /**
     * Specify the type of div the accessible layer is. Screen readers treat the element differently
     * depending on this type. Defaults to button.
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     * @default 'button'
     */
    accessibleType: 'button',

    /**
     * Specify the pointer-events the accessible div will use
     * Defaults to auto.
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     * @default 'auto'
     */
    accessiblePointerEvents: 'auto',

    /**
     * Setting to false will prevent any children inside this container to
     * be accessible. Defaults to true.
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @default true
     */
    accessibleChildren: true,
};

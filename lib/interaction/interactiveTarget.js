'use strict';

exports.__esModule = true;
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
exports.default = {
  /**
   * Determines if the displayObject be clicked/touched
   *
   * @inner {boolean}
   */
  interactive: false,

  /**
   * Determines if the children to the displayObject can be clicked/touched
   * Setting this to false allows pixi to bypass a recursive hitTest function
   *
   * @inner {boolean}
   */
  interactiveChildren: true,

  /**
   * Interaction shape. Children will be hit first, then this shape will be checked.
   * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
   *
   * @inner {PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle}
   */
  hitArea: null,

  /**
   * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
   * Setting this changes the 'cursor' property to `'pointer'`.
   *
   * @member {boolean}
   * @memberof PIXI.interaction.interactiveTarget#
   */
  get buttonMode() {
    return this.cursor === 'pointer';
  },
  set buttonMode(value) {
    if (value) {
      this.cursor = 'pointer';
    } else if (this.cursor === 'pointer') {
      this.cursor = null;
    }
  },

  /**
   * This defines what cursor mode is used when the mouse cursor
   * is hovered over the displayObject.
   *
   * @see https://developer.mozilla.org/en/docs/Web/CSS/cursor
   *
   * @inner {string}
   */
  cursor: null,

  /**
   * Internal set of all active pointers, by identifier
   *
   * @member {Map<number, InteractionTrackingData>}
   * @memberof PIXI.interaction.interactiveTarget#
   * @private
   */
  get trackedPointers() {
    if (this._trackedPointers === undefined) this._trackedPointers = {};

    return this._trackedPointers;
  },

  /**
   * Map of all tracked pointers, by identifier. Use trackedPointers to access.
   *
   * @private {Map<number, InteractionTrackingData>}
   */
  _trackedPointers: undefined
};
//# sourceMappingURL=interactiveTarget.js.map
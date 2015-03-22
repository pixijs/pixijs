/**
 * Default property values of interactive objects
 * used by {@link PIXI.interaction.InteractionManager}.
 *
 * @mixin
 * @memberof PIXI.interaction
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.interaction.interactiveTarget)
 *      );
 */

module.exports = {
    /**
     * @todo
     */
    interactive: false,
    /**
     * @todo
     */
    buttonMode: false,
    /**
     * @todo
     */
    interactiveChildren: true,
    /**
     * @todo
     */
    defaultCursor: 'pointer',

    // some internal checks..

    /**
     * @todo
     * @private
     */
    _over: false,
    /**
     * @todo
     * @private
     */
    _touchDown: false
};

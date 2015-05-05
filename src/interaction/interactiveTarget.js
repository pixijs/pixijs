var core = require('../core');

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
     * @todo Needs docs.
     */
    interactive: false,
    /**
     * @todo Needs docs.
     */
    buttonMode: false,
    /**
     * @todo Needs docs.
     */
    interactiveChildren: true,
    /**
     * @todo Needs docs.
     */
    defaultCursor: 'pointer',    
    
    /**
     * The threshold in px used to check if a tap occured on the interactive object.
     */
    tapThreshold: 8,

    // some internal checks..

    /**
     * @todo Needs docs.
     * @private
     */
    _over: false,
    /**
     * @todo Needs docs.
     * @private
     */
    _touchDown: false,
    
    /**
     * Used to track the global start position of a touchdown event on this target.
     * @private
     */
    _touchDownPoint: new core.Point()
};

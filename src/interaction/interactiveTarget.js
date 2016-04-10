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
 *          PIXI.interaction.interactiveTarget
 *      );
 */
var interactiveTarget = {
    /**
     * Determines if the displayObject be clicked/touched
     * 
     * @member {boolean}
     */
    interactive: false,
    
    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows pixi to bypass a recursive hitTest function 
     * 
     * @member {boolean}
     */
    interactiveChildren: true,
    
    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     *
     * @member {PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle}
     */
    hitArea = null,
    
    /**
     * If enabled, the mouse cursor will change when hovered over the displayObject if it is interactive 
     *
     * @member {boolean}
     */
    buttonMode: false,
    
    /**
     * If buttonMode is enabled, this defines what CSS cursor property is used when the mouse cursor is hovered over the displayObject
     * https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *  
     * @member {string}
     */
    defaultCursor: 'pointer',

    // some internal checks..
    /**
     * Internal check to detect if the mouse cursor is hovered over the displayObject
     * 
     * @member {boolean}
     * @private
     */
    _over: false,
        
    /**
     * Internal check to detect if the left mouse button is pressed on the displayObject
     * 
     * @member {boolean}
     * @private
     */
    _isLeftDown: false,
    
    /**
     * Internal check to detect if the right mouse button is pressed on the displayObject
     * 
     * @member {boolean}
     * @private
     */
    _isRightDown: false,
    
    /**
     * Internal check to detect if a user has touched the displayObject
     * 
     * @member {boolean}
     * @private
     */
    _touchDown: false,
 };

module.exports = interactiveTarget;

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
var interactiveTargetProxy = {
    interactive: {
        get: function() {
            return this.original.interactive;
        }
    },
    buttonMode: {
        get: function() {
            return this.original.buttonMode;
        }
    },
    interactiveChildren: {
        get: function() {
            return this.original.interactiveChildren;
        }
    },
    defaultCursor: {
        get: function() {
            return this.original.defaultCursor;
        }
    }
};

module.exports = interactiveTargetProxy;

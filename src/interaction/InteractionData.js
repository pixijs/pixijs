var core = require('../core');

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI.interaction
 */
function InteractionData()
{
    /**
     * This point stores the global coords of where the touch/mouse event happened
     *
     * @member {PIXI.Point}
     */
    this.global = new core.DisplayPoint();

    /**
     * The target Sprite that was interacted with
     *
     * @member {PIXI.Sprite}
     * @private
     */
    this._target = null;

    /**
     * The target proxy that was interacted with
     *
     * @member {PIXI.Sprite}
     */
    this.targetProxy = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @member {Event}
     */
    this.originalEvent = null;
}

InteractionData.prototype.constructor = InteractionData;
module.exports = InteractionData;

Object.defineProperties(InteractionData.prototype, {
    target: {
        get: function() {
            return this._target;
        },
        set: function(value) {
            if (value && value.original) {
                this._target = value.getOriginal();
                this.targetProxy = value;
            } else {
                this._target = value;
                this.targetProxy = null;
            }
        }
    }
});

/**
 * This will return the local coordinates of the specified displayObject for this InteractionData
 * Legacy function
 *
 * @param displayObject {PIXI.DisplayObject} The DisplayObject that you would like the local coords off
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new point)
 * @param [globalPos] {PIXI.DisplayPoint} A Point object containing your custom global coords, optional (otherwise will use the current global coords)
 * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative to the DisplayObject
 */
InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos)
{
    point = point || new core.Point();
    point.copy(displayObject.raycast(globalPos || this.global, true));
    return point;
};

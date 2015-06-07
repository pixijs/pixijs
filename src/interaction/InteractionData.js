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
     * @member {Point}
     */
    this.global = new core.Point();

    /**
     * The target Sprite that was interacted with
     *
     * @member {Sprite}
     */
    this.target = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @member {Event}
     */
    this.originalEvent = null;
}

InteractionData.prototype.constructor = InteractionData;
module.exports = InteractionData;

/**
 * This will return the local coordinates of the specified displayObject for this InteractionData
 *
 * @param displayObject {DisplayObject} The DisplayObject that you would like the local coords off
 * @param [point] {Point} A Point object in which to store the value, optional (otherwise will create a new point)
 * param [globalPos] {Point} A Point object containing your custom global coords, optional (otherwise will use the current global coords)
 * @return {Point} A point containing the coordinates of the InteractionData position relative to the DisplayObject
 */
InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos)
{
    var worldTransform = displayObject.worldTransform;
    var global = globalPos ? globalPos : this.global;

    // do a cheeky transform to get the mouse coords;
    var a00 = worldTransform.a, a01 = worldTransform.c, a02 = worldTransform.tx,
        a10 = worldTransform.b, a11 = worldTransform.d, a12 = worldTransform.ty,
        id = 1 / (a00 * a11 + a01 * -a10);

    point = point || new core.Point();

    point.x = a11 * id * global.x + -a01 * id * global.x + (a12 * a01 - a02 * a11) * id;
    point.y = a00 * id * global.y + -a10 * id * global.y + (-a12 * a00 + a02 * a10) * id;

    // set the mouse coords...
    return point;
};

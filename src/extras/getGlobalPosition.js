import * as core from '../core';

/**
 * Returns the global position of the displayObject. Does not depend on object scale, rotation and pivot.
 *
 * @memberof PIXI.DisplayObject#
 * @param {Point} point - the point to write the global value to. If null a new point will be returned
 * @param {boolean} skipUpdate - setting to true will stop the transforms of the scene graph from
 *  being updated. This means the calculation returned MAY be out of date BUT will give you a
 *  nice performance boost
 * @return {Point} The updated point
 */
core.DisplayObject.prototype.getGlobalPosition = function getGlobalPosition(point = new core.Point(), skipUpdate = false)
{
    if (this.parent)
    {
        this.parent.toGlobal(this.position, point, skipUpdate);
    }
    else
    {
        point.x = this.position.x;
        point.y = this.position.y;
    }

    return point;
};

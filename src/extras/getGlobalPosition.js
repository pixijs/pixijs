import * as core from '../core';

/**
 * Returns the global position of the displayObject
 *
 * @memberof PIXI.DisplayObject#
 * @param {Point} point - the point to write the global value to. If null a new point will be returned
 * @return {Point} The updated point
 */
core.DisplayObject.prototype.getGlobalPosition = function getGlobalPosition(point = new core.Point())
{
    if (this.parent)
    {
        this.displayObjectUpdateTransform();

        point.x = this.worldTransform.tx;
        point.y = this.worldTransform.ty;
    }
    else
    {
        point.x = this.position.x;
        point.y = this.position.y;
    }

    return point;
};

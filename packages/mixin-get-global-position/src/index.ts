import { DisplayObject } from '@pixi/display';
import { Point } from '@pixi/math';

/**
 * Returns the global position of the displayObject. Does not depend on object scale, rotation and pivot.
 *
 * @method getGlobalPosition
 * @memberof PIXI.DisplayObject#
 * @param {PIXI.Point} [point=new PIXI.Point()] - The point to write the global value to.
 * @param {boolean} [skipUpdate=false] - Setting to true will stop the transforms of the scene graph from
 *  being updated. This means the calculation returned MAY be out of date BUT will give you a
 *  nice performance boost.
 * @return {PIXI.Point} The updated point.
 */
DisplayObject.prototype.getGlobalPosition = function getGlobalPosition(point: Point = new Point(), skipUpdate = false): Point
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

var DisplayObject = require('../core/display/DisplayObject'),
    Point = require('../core/math/Point');


/**
* Returns the global position of the displayObject
*
* @param point {Point} the point to write the global value to. If null a new point will be returned
* @return {Point}
*/
DisplayObject.prototype.getGlobalPosition = function (point)
{
    point = point || new Point();

    if(this.parent)
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

module.exports = {};

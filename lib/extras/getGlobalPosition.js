'use strict';

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
core.DisplayObject.prototype.getGlobalPosition = function getGlobalPosition() {
    var point = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new core.Point();
    var skipUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (this.parent) {
        this.parent.toGlobal(this.position, point, skipUpdate);
    } else {
        point.x = this.position.x;
        point.y = this.position.y;
    }

    return point;
};
//# sourceMappingURL=getGlobalPosition.js.map
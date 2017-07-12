'use strict';

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * The instance name of the object.
 *
 * @memberof PIXI.DisplayObject#
 * @member {string}
 */
core.DisplayObject.prototype.name = null;

/**
 * Returns the display object in the container
 *
 * @memberof PIXI.Container#
 * @param {string} name - instance name
 * @return {PIXI.DisplayObject} The child with the specified name.
 */
core.Container.prototype.getChildByName = function getChildByName(name) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].name === name) {
            return this.children[i];
        }
    }

    return null;
};
//# sourceMappingURL=getChildByName.js.map
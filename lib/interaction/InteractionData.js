'use strict';

exports.__esModule = true;

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI.interaction
 */
var InteractionData = function () {
  /**
   *
   */
  function InteractionData() {
    _classCallCheck(this, InteractionData);

    /**
     * This point stores the global coords of where the touch/mouse event happened
     *
     * @member {PIXI.Point}
     */
    this.global = new core.Point();

    /**
     * The target Sprite that was interacted with
     *
     * @member {PIXI.Sprite}
     */
    this.target = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @member {Event}
     */
    this.originalEvent = null;
  }

  /**
   * This will return the local coordinates of the specified displayObject for this InteractionData
   *
   * @param {PIXI.DisplayObject} displayObject - The DisplayObject that you would like the local
   *  coords off
   * @param {PIXI.Point} [point] - A Point object in which to store the value, optional (otherwise
   *  will create a new point)
   * @param {PIXI.Point} [globalPos] - A Point object containing your custom global coords, optional
   *  (otherwise will use the current global coords)
   * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative
   *  to the DisplayObject
   */


  InteractionData.prototype.getLocalPosition = function getLocalPosition(displayObject, point, globalPos) {
    return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
  };

  return InteractionData;
}();

exports.default = InteractionData;
//# sourceMappingURL=InteractionData.js.map
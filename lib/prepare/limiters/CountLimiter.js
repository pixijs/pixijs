"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * CountLimiter limits the number of items handled by a {@link PIXI.prepare.BasePrepare} to a specified
 * number of items per frame.
 *
 * @class
 * @memberof PIXI
 */
var CountLimiter = function () {
  /**
   * @param {number} maxItemsPerFrame - The maximum number of items that can be prepared each frame.
   */
  function CountLimiter(maxItemsPerFrame) {
    _classCallCheck(this, CountLimiter);

    /**
     * The maximum number of items that can be prepared each frame.
     * @private
     */
    this.maxItemsPerFrame = maxItemsPerFrame;
    /**
     * The number of items that can be prepared in the current frame.
     * @type {number}
     * @private
     */
    this.itemsLeft = 0;
  }

  /**
   * Resets any counting properties to start fresh on a new frame.
   */


  CountLimiter.prototype.beginFrame = function beginFrame() {
    this.itemsLeft = this.maxItemsPerFrame;
  };

  /**
   * Checks to see if another item can be uploaded. This should only be called once per item.
   * @return {boolean} If the item is allowed to be uploaded.
   */


  CountLimiter.prototype.allowedToUpload = function allowedToUpload() {
    return this.itemsLeft-- > 0;
  };

  return CountLimiter;
}();

exports.default = CountLimiter;
//# sourceMappingURL=CountLimiter.js.map
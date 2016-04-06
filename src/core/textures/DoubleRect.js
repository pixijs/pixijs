var math = require('../math');

/**
 * Rectangle that may have the other in the inside
 * @class
 * @extends PIXI.Rectangle
 * @memberof PIXI
 * @param outer optional, will be copied from
 * @param inner optional, will be stored inside DoubleRect as inner rect. Either you pass cloned copy, either you know what you are doing.
 */
function DoubleRect(outer, inner) {
    math.Rectangle.call(this, 0, 0, 1, 1);
    if (outer) {
        this.copy(outer);
    }
    this.inner = inner || null;
    this.version = 0;
}

DoubleRect.prototype = Object.create(math.Rectangle.prototype);
DoubleRect.prototype.constructor = DoubleRect;
module.exports = DoubleRect;

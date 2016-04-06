var math = require('../math/index'),
    ObservablePoint = require('../display/ObservablePoint'),
    DoubleRect = require('../textures/DoubleRect');

/**
 * Rectangle with one inside of its
 * @class
 * @extends PIXI.DoubleRect
 * @memberof PIXI
 * @param {PIXI.DoubleRect} outer optional, will be copied from
 */
function SpriteFrame(textureFrame) {
    DoubleRect.call(this);

    /**
     * Original texture frame (not the texture)
     * @member {PIXI.DoubleRect}
     */
    this.textureFrame = textureFrame;

    /**
     * Sprite anchor. read-only
     * @member {PIXI.ObservablePoint}
     */
    this.anchor = new ObservablePoint(this.update, this, 0, 0);

    /**
     * Sprite size, overrides texture dimensions
     * @type {PIXI.ObservablePoint}
     */
    this.size = new ObservablePoint(this.update, this, 0, 0);

    /**
     * version, changes every time update() is called
     * @type {number}
     */
    this.version = 0;
}

SpriteFrame.prototype = Object.create(DoubleRect.prototype);
SpriteFrame.prototype.constructor = SpriteFrame;
module.exports = SpriteFrame;

SpriteFrame.prototype.update = function() {
    this.version++;
    var s = this.size;
    var sizeX = s._x, sizeY = s._y;
    var orig = this.textureFrame;
    if (sizeX === 0) {
        if (sizeY === 0) {
            sizeX = orig.width;
            sizeY = orig.height;
        } else {
            sizeX = orig.width * sizeY / orig.height;
        }
    } else {
        if (sizeY === 0) {
            sizeY = orig.height * sizeX / orig.width;
        }
    }
    var scaleX = sizeX / orig.width, scaleY = sizeY / orig.height;
    this.width = sizeX;
    this.height = sizeY;
    this.x = - this.anchor._x * sizeX;
    this.y = - this.anchor._y * sizeY;

    var trim = orig.inner;
    if (trim) {
        var inner = this.inner = this.inner || new math.Rectangle(0, 0, 1, 1);
        inner.width = trim.width * scaleX;
        inner.height = trim.height * scaleY;
        inner.x = this.x + trim.x * scaleX;
        inner.y = this.y + trim.y * scaleY;
    } else {
        this.inner = null;
    }
};

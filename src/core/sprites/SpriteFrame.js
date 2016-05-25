var math = require('../math'),
    ObservablePoint = require('../display/ObservablePoint');

/**
 * Pair of rects that depend on textureFrame
 * @class
 * @extends PIXI.Rectangle
 * @memberof PIXI
 * @param {PIXI.DoubleRect} texture frame we will depend upon
 */
function SpriteFrame(textureFrame) {
    math.Rectangle.call(this, 0, 0, 1, 1);

    this.inner = null;
    /**
     * Original texture frame (not the texture)
     * @member {PIXI.DoubleRect}
     * @private
     */
    this._textureFrame = textureFrame;

    /**
     * Sprite anchor. read-only
     * @member {PIXI.ObservablePoint}
     */
    this.anchor = new ObservablePoint(this.makeDirty, this, 0, 0);

    /**
     * Sprite size, overrides texture dimensions
     * @type {PIXI.ObservablePoint}
     */
    this.size = new ObservablePoint(this.makeDirty, this, 0, 0);

    /**
     * dirty version, increased when anchor or size is changing
     * @type {number}
     * @private
     */
    this._dirtyVersion = 0;

    /**
     * texture frame version
     * @type {number}
     * @private
     */
    this._textureVersion = 0;
}

SpriteFrame.prototype = Object.create(math.Rectangle.prototype);
SpriteFrame.prototype.constructor = SpriteFrame;
module.exports = SpriteFrame;

Object.defineProperties(SpriteFrame.prototype, {
    /**
     * Original texture frame (not the texture)
     * @member {PIXI.DoubleRect}
     * @memberof PIXI.SpriteFrame#
     */
    textureFrame: {
        get: function() {
            return this._textureFrame;
        },
        set: function(value) {
            this._textureFrame = value;
            this._dirtyVersion++;
        }
    },
    spriteWidth: {
        get: function() {
            return (this.inner || this).width;
        }
    },
    spriteHeight: {
        get: function() {
            return (this.inner || this).height;
        }
    }
});

SpriteFrame.prototype._update = function() {
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

/**
 * Invalidate
 */
SpriteFrame.prototype.makeDirty = function() {
    this._dirtyVersion++;
};

SpriteFrame.prototype.update = function() {
    if (this.version !== this._dirtyVersion ||
        this._textureVersion !== this._textureFrame.version) {
        this.version = this._dirtyVersion;
        this._textureVersion = this.textureFrame.version;

        this._update();
    }
};

var ObservableRect = require('./ObservableRect');

/**
 * Rectangle that may have the other in the inside
 * @class
 * @extends PIXI.ObservableRect
 * @memberof PIXI
 * @param outer optional, will be copied from
 * @param inner optional, will be stored inside DoubleRect as inner rect. Either you pass cloned copy, either you know what you are doing.
 */
function DoubleRect(outer, inner) {
    ObservableRect.call(this, this.makeDirty, this);
    if (outer) {
        this.copy(outer);
    }
    this._inner = null;
    this.inner = inner || null;
    this.version = 0;
}

DoubleRect.prototype = Object.create(ObservableRect.prototype);
DoubleRect.prototype.constructor = DoubleRect;
module.exports = DoubleRect;

Object.defineProperties(DoubleRect.prototype, {
    inner: {
        get: function() {
            return this._inner;
        },
        set: function(value) {
            if (value) {
                this._inner = this._inner || new ObservableRect(this.makeDirty, this);
                this._inner.copy(value);
            } else {
                this._inner = null;
            }
        }
    }
});

/**
 * Invalidates everything depending on this rect
 */
DoubleRect.prototype.makeDirty = function() {
    this.version++;
};

var Point = require('../math/Point'),
    utils = require('../utils');

function Raycast2d() {
    this._raycastUid = -1;
    this._raycastVersion = -1;
    this._transformUid = -1;
    this._transformVersion = -1;
    this._point = new Point();
    this.is3d = false;
    this.valid = false;
    this.intersects = false;
    this.version = 0;
    this.uid = utils.uid();
}

Object.defineProperties(Raycast2d.prototype, {
    x: {
        get: function() {
            return this._point.x;
        }
    },
    y: {
        get: function() {
            return this._point.y;
        }
    }
});

Raycast2d.prototype.constructor = Raycast2d;
module.exports = Raycast2d;

Raycast2d.prototype.applyTransformStatic = function(raycast, transform) {
    if (this._raycastUid &&
        this._transformUid === transform.uid &&
        this._transformVersion === transform.version &&
        this._raycastUid === raycast.uid &&
        this._raycastVersion === raycast.version) {
        return false;
    }
    this._transformUid = transform.uid;
    this._transformVersion = transform.version;
    this._raycastUid = raycast.uid;
    this._raycastVersion = raycast.version;

    this.applyTransform(raycast, transform);
    return true;
};

Raycast2d.prototype.childApplyTransform = function(child, transform) {
    if (!this.valid) {
        if (child) {
            child.valid = false;
            child.intersects = false;
            return child;
        }
        return null;
    }
    child = child || new Raycast2d();
    return transform.updateRaycast(child, this);
};

Raycast2d.prototype.applyTransform = function(raycast, transform) {
    this.valid = true;
    this.intersects = false;
    transform.matrix.applyInverse(raycast._point, this._point);
};

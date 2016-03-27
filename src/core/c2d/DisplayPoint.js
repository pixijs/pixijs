var Point = require('../math/Point'),
    utils = require('../utils'),
    Raycast2d = require('./Raycast2d');

function DisplayPoint() {
    this._point = new Point();
    this.uid = utils.uid();
    this.is3d = false;
    this.version = 0;
    this.valid = true;
}

Object.defineProperties(DisplayPoint.prototype, {
    x: {
        get: function() {
            return this._point.x;
        },
        set: function(value) {
            if (this._point.x !== value) {
                this.version++;
                this._point.x = value;
            }
        }
    },
    y: {
        get: function() {
            return this._point.y;
        },
        set: function(value) {
            if (this._point.y !== value) {
                this.version++;
                this._point.y = value;
            }
        }
    }
});

DisplayPoint.prototype.constructor = DisplayPoint;
module.exports = DisplayPoint;

DisplayPoint.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
};

DisplayPoint.prototype.copy = function(point) {
    this.x = point.x;
    this.y = point.y;
};

/**
 * Entry for applying transform to child. Inside three more recursive functions
 * @param {PIXI.Raycast2d} child
 * @param {PIXI.ComputedTransform2d} transform
 */
DisplayPoint.prototype.childApplyTransform = function(child, transform) {
    child = child || new Raycast2d();
    transform.updateRayCast(child, this);
};

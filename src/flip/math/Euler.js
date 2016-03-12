/**
 * The Euler angles, order is YZX
 * @class
 * @namespace PIXI
 * @param x pitch
 * @param y yaw
 * @param z roll
 * @constructor
 */
function Euler(x, y, z) {
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.z = z || 0;
}

Object.defineProperties(Euler.prototype, {
    /**
     * @member {number}
     * @memberof PIXI.Euler#
     */
    yaw: {
        get: function () {
            return this.y;
        },
        set: function (value) {
            this.y = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Euler#
     */
    pitch: {
        get: function () {
            return this.x;
        },
        set: function (value) {
            this.x = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Euler#
     */
    roll: {
        get: function () {
            return this.z;
        },
        set: function (value) {
            this.z = value;
        }
    }
});

Euler.prototype.constructor = Euler;
module.exports = Euler;

/**
 * Creates a clone of this Euler angles
 *
 * @return {Euler} a copy of the Euler
 */
Euler.prototype.clone = function () {
    return new Euler(this.x, this.y, this.z);
};

/**
 * Sets the Euler angles
 * @param x pitch
 * @param y yaw
 * @param z roll
 */
Euler.prototype.set = function (x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

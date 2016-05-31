var quat = require('gl-matrix').quat;

/**
 * The Euler angles, order is YZX. Except for projections (camera.lookEuler), its reversed XZY
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
    this._x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this._y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this._z = z || 0;

    this.quaternion = quat.create();
    this.version = 0;
    this._dirtyVersion = 1;
    this._sign = 1;

    this.update();
}

Object.defineProperties(Euler.prototype, {
    /**
     * Yaw angle
     * @member {number}
     * @memberof PIXI.Euler#
     */
    yaw: {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this._dirtyVersion++;
            }
        }
    },
    /**
     * Pitch angle
     * @member {number}
     * @memberof PIXI.Euler#
     */
    pitch: {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this._dirtyVersion++;
            }
        }
    },
    /**
     * Roll angle
     * @member {number}
     * @memberof PIXI.Euler#
     */
    roll: {
        get: function () {
            return this._z;
        },
        set: function (value) {
            if (this._z !== value) {
                this._z = value;
                this._dirtyVersion++;
            }
        }
    },
    /**
     * Yaw angle
     * @member {number}
     * @memberof PIXI.Euler#
     */
    y: {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this._dirtyVersion++;
            }
        }
    },
    /**
     * Pitch angle
     * @member {number}
     * @memberof PIXI.Euler#
     */
    x: {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this._dirtyVersion++;
            }
        }
    },
    /**
     * Roll angle
     * @member {number}
     * @memberof PIXI.Euler#
     */
    z: {
        get: function () {
            return this._z;
        },
        set: function (value) {
            if (this._z !== value) {
                this._z = value;
                this._dirtyVersion++;
            }
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
    var _x = x || 0;
    var _y = y || 0;
    var _z = z || 0;
    if (this._x !== _x || this._y !== _y || this._z !== _z) {
        this._x = _x;
        this._y = _y;
        this._z = _z;
        this._dirtyVersion++;
    }
};


/**
 * Sets the Euler angles
 * @param euler angles to copy from
 */
Euler.prototype.copy = function (euler) {
    var _x = euler.x;
    var _y = euler.y;
    var _z = euler.z;
    if (this._x !== _x || this._y !== _y || this._z !== _z) {
        this._x = _x;
        this._y = _y;
        this._z = _z;
        this._dirtyVersion++;
    }
};

Euler.prototype.update = function() {
    if (this.version === this._dirtyVersion) {
        return false;
    }
    this.version = this._dirtyVersion;

    var c1 = Math.cos(this._x / 2);
    var c2 = Math.cos(this._y / 2);
    var c3 = Math.cos(this._z / 2);

    var s = this._sign;
    var s1 = s * Math.sin(this._x / 2);
    var s2 = s * Math.sin(this._y / 2);
    var s3 = s * Math.sin(this._z / 2);

    var q = this.quaternion;
    q[0] = s1 * c2 * c3 + c1 * s2 * s3;
    q[1] = c1 * s2 * c3 - s1 * c2 * s3;
    q[2] = c1 * c2 * s3 + s1 * s2 * c3;
    q[3] = c1 * c2 * c3 - s1 * s2 * s3;

    return true;
};

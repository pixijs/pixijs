var vec3 = require('gl-matrix').vec3;

/**
 * Sphere for bounds
 *
 * @class
 * @namespace PIXI
 */
function Sphere()
{
    /**
     * @member {Float32Array}
     */
    this.v = vec3.create();


    /**
     * @member {Number}
     */
    this.r = 0;
}

Sphere.prototype.constructor = Sphere;
module.exports = Sphere;

Object.defineProperties(Sphere.prototype, {
    /**
     * @member {number}
     * @memberof PIXI.Sphere#
     */
    x: {
        get: function () {
            return this.v[0];
        },
        set: function (value) {
            this.v[0] = value;
        }
    },
    y: {
        get: function () {
            return this.v[1];
        },
        set: function (value) {
            this.v[1] = value;
        }
    },
    z: {
        get: function () {
            return this.v[2];
        },
        set: function (value) {
            this.v[2] = value;
        }
    }
});

/**
 * Creates a clone of this point3d
 *
 * @return {Point3d} a copy of the point3d
 */
Sphere.prototype.clone = function ()
{
    var s = new Sphere();
    vec3.copy(s.v, this.v);
    s.r = this.r;
};

Sphere.prototype.set = function (x, y, z, r)
{
    this.v[0] = x || 0;
    this.v[1] = y || 0;
    this.v[2] = z || 0;
    this.r = r || 0;
};

Sphere.prototype.copy = function (s)
{
    vec3.copy(this.v, s.v);
    this.r = s.r;
};


Sphere.prototype.enlarge = function(s) {
    if (s === Sphere.EMPTY) {
        return;
    }
    var v1 = this.v, v2 = s.v , r1 = this.r, r2 = s.r;
    var d = vec3.distance(v1, v2);
    var r = (r1 + r2 + d) / 2;
    if (r < r1) {
        return;
    }
    if (r < r2) {
        vec3.copy(v1, v2);
        this.r = r2;
        return;
    }
    this.r = r;
    if (d > 1e-9) {
        vec3.lerp(v1, v1, v2, (-r1 + r) / d);
    }
};

Sphere.EMPTY = new Sphere();

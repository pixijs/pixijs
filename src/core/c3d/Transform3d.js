/*global console */

var ObservablePoint3d = require('./ObservablePoint3d'),
    Point3d = require('./Point3d'),
    Euler = require('./Euler'),
    ComputedTransform3d = require('./ComputedTransform3d'),
    utils = require('../utils'),
    glMat = require('gl-matrix'),
    mat4 = glMat.mat4;

var tempMatrix = mat4.create();


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function Transform3d(isStatic)
{
    /**
     * @member {Float32Array} The global matrix transform
     */
    this.matrix3d = mat4.create();

    this.isStatic = !!isStatic;

     /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    this.position = isStatic ? new ObservablePoint3d(this.makeDirty, this, 0,0,0) : new Point3d(0,0,0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    this.scale = isStatic ? new ObservablePoint3d(this.makeDirty, this, 1,1,1) : new Point3d(1,1,1);

    /**
     * The euler angles of the object.
     *
     * @member {PIXI.Euler}
     */
    this.euler = new Euler(0,0,0);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    this.pivot = isStatic ? new ObservablePoint3d(this.makeDirty, this, 0,0,0) : new Point3d(0,0,0);

    this._dirtyVersion = 0;
    this.version = 0;
    this._eulerVersion = 0;
    this.is3d = true;
    this.operType = 0;

    this.uid = utils.incTransform();
}

Transform3d.prototype.constructor = Transform3d;

Transform3d.prototype.makeDirty = function() {
    this._dirtyVersion++;
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
Transform3d.prototype.update = function ()
{
    this.euler.update();
    if (this.isStatic &&
        this.version === this._dirtyVersion &&
        this._eulerVersion === this.euler.version) {
        return false;
    }
    this.version = ++this._dirtyVersion;
    this._eulerVersion = this.euler.version;
    var isTranslation = true;

    var matrix = this.matrix3d;

    var rx = this.euler._x;
    var ry = this.euler._y;
    var rz = this.euler._z;

    tempMatrix[0] = this.position.x;
    tempMatrix[1] = this.position.y;
    tempMatrix[2] = this.position.z;
    if (rx !== 0 || ry !== 0 || rz !== 0) {
        isTranslation = false;
        mat4.fromRotationTranslation(matrix, this.euler.quaternion, tempMatrix);
    } else
    {
        mat4.fromTranslation(matrix, tempMatrix);
    }

    rx = this.scale.x; ry = this.scale.y; rz = this.scale.z;
    if (rx !== 1 || ry !== 1 || rz !== 1) {
        isTranslation = false;
        tempMatrix[0] = rx;
        tempMatrix[1] = ry;
        tempMatrix[2] = rz;
        mat4.scale(matrix, matrix, tempMatrix);
    }

    rx = this.pivot.x; ry = this.pivot.y; rz = this.pivot.z;

    if (rx || ry || rz) {
        tempMatrix[0] = -rx;
        tempMatrix[1] = -ry;
        tempMatrix[2] = -rz;
        mat4.translate(matrix, matrix, tempMatrix);
    }

    this.operType = isTranslation ? 1 : 0;
    return true;
};

/**
 * Decomposes a matrix and sets the transforms properties based on it.
 * @param {Float32Array}
 */
Transform3d.prototype.setFromMatrix = function ()
{
    console.log('Sorry, but Transform3d.setFromMatrix is not implemented yet');
    //3d matrix decomposition, to be implemented
};

Transform3d.prototype.makeComputedTransform = function(computedTransform) {
    if (!computedTransform || !computedTransform.is3d || computedTransform._dirtyLocalUid !== this.uid) {
        computedTransform = new ComputedTransform3d();
    }
    computedTransform.matrix3d = this.matrix3d;
    computedTransform.version = this.version;
    return computedTransform;
};

Transform3d.prototype.destroy = function() {
    if (this.isStatic) {
        this.position.destroy();
        this.scale.destroy();
        this.pivot.destroy();
        this.euler.destroy();
    }

    this.position = null;
    this.scale = null;
    this.pivot = null;
    this.skew = null;
};

Object.defineProperties(Transform3d.prototype, {
    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    rotation: {
        get: function () {
            return this.euler.z;
        },
        set: function (value) {
            this.euler.z = value;
        }
    },
    matrix: {
        get: function() {
            return this.matrix3d;
        }
    }
});

module.exports = Transform3d;

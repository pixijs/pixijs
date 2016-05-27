var utils = require('../utils'),
    ComputedGeometry3d = require('./ComputedGeometry3d'),
    Raycast3d = require('./Raycast3d'),
    glMat = require('gl-matrix'),
    mat4 = glMat.mat4,
    vec3 = glMat.vec3;

var tempMatrix1 = mat4.create(), tempMatrix2 = mat4.create(), tempVec = vec3.create();

/**
 * Local transforum multiplied to parents world
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function ComputedTransform3d() {
    /**
     * @member {PIXI.Matrix} The global matrix transform
     */
    this.matrix3d = new mat4.create();

    this.version = 0;
    this.uid = utils.incTransform();
    this.is3d = true;
    this.updated = false;
    this._dirtyLocalUid = -1;
    this._dirtyLocalVersion = -1;
    this._dirtyParentUid = -1;
    this._dirtyParentVersion = -1;

    this.computedRaycast = null;
    this._dirtyRaycastUid = -1;
    this._dirtyRaycastVersion = -1;
    this._dirtyRaycastMyVersion = -1;
}

ComputedTransform3d.prototype.constructor = ComputedTransform3d;

ComputedTransform3d.prototype.getIdentityMatrix = function () {
    return ComputedTransform3d.IDENTITY.matrix3d;
};

ComputedTransform3d.prototype.getIdentityTransform = function () {
    return ComputedTransform3d.IDENTITY;
};

ComputedTransform3d.IDENTITY = new ComputedTransform3d();

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.ComputedTransform3d | PIXI.ComputedTransform2d} The transform of the parent of this object
 * @param  localTransform {PIXI.Transform3d | PIXI.Transform2d} The transform of the parent of this object
 *
 */
ComputedTransform3d.prototype.updateTransform = function (parentTransform, localTransform) {
    if (this._dirtyLocalUid === localTransform.uid &&
        this._dirtyLocalVersion === localTransform.version &&
        this._dirtyParentUid === parentTransform.uid &&
        this._dirtyParentVersion === parentTransform.version) {
        this.updated = false;
        return false;
    }

    this._dirtyLocalUid = localTransform.uid;
    this._dirtyLocalVersion = localTransform.version;
    this._dirtyParentUid = parentTransform.uid;
    this._dirtyParentVersion = parentTransform.version;

    var wt = this.matrix3d;
    var pt = parentTransform.is3d ? parentTransform.matrix3d : parentTransform.matrix2d.toMat4(tempMatrix1);
    if (localTransform.operType === 2) {
        //identity
        mat4.copy(wt, pt);
    } else {
        var lt = localTransform.is3d ? localTransform.matrix3d : localTransform.matrix2d.toMat4(tempMatrix2);
        if (localTransform.operType === 1) {
            //translation
            mat4.translate(wt, pt, mat4.getTranslation(tempVec, lt));
        } else {
            mat4.multiply(wt, pt, lt);
        }
    }

    this.updated = true;
    this.version++;
    return true;
};

ComputedTransform3d.prototype.updateRaycast = function (parentRaycast) {
    if (this._dirtyRaycastMyVersion === this.version &&
        this._dirtyRaycastUid === parentRaycast.uid &&
        this._dirtyRaycastVersion === parentRaycast.version) {
        this.updated = false;
        return false;
    }

    this.computedRaycast = this.updateChildRaycast(this.computedRaycast, parentRaycast);
    return this.computedRaycast;
};

ComputedTransform3d.prototype.updateChildTransform = function (childTransform, localTransform) {
    if (!childTransform.is3d) {
        childTransform = new ComputedTransform3d();
    }
    childTransform.updateTransform(this, localTransform);
    return childTransform;
};

ComputedTransform3d.prototype.updateChildReverseTransform = function (childTransform, localTransform) {
    if (!childTransform || !childTransform.is3d) {
        childTransform = new ComputedTransform3d();
    }
    childTransform.updateTransform(localTransform, this);
    return childTransform;
};

ComputedTransform3d.prototype.checkChildReverseTransform = function (childTransform, localTransform) {
    if (!childTransform) {
        return true;
    }

    if (childTransform._dirtyLocalUid === this.uid &&
        childTransform._dirtyLocalVersion === this.version &&
        childTransform._dirtyParentUid === localTransform.uid &&
        childTransform._dirtyParentVersion === localTransform.version) {
        return false;
    }

    return true;
};


/**
 * Get bounds of geometry based on its stride
 *
 * @param geometry
 * @param bounds
 * @returns {*}
 */
ComputedTransform3d.prototype.updateChildGeometry = function (computedGeometry, geometry) {
    if (!geometry || !geometry.valid) {
        return null;
    }
    if (!computedGeometry || !computedGeometry.is3d) {
        computedGeometry = new ComputedGeometry3d();
    }
    computedGeometry.applyTransformStatic(geometry, this);
    return computedGeometry;
};

ComputedTransform3d.prototype.updateChildRaycast = function (computedRaycast, parentRaycast) {
    if (!parentRaycast) {
        return null;
    }
    if (!computedRaycast || !computedRaycast.is3d) {
        computedRaycast = new Raycast3d();
    }
    computedRaycast.applyTransformStatic(parentRaycast, this);
    return computedRaycast;
};

Object.defineProperties(ComputedTransform3d.prototype, {
    matrix: {
        get: function () {
            return this.matrix3d;
        }
    }
});
module.exports = ComputedTransform3d;

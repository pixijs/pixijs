var Geometry3d = require('./Geometry3d'),
    glMat = require('gl-matrix'),
    mat4 = glMat.vec4,
    vec3 = glMat.vec3;

var tempMatrix = mat4.create(), tempVec3 = vec3.create();

/**
 * Mutable storage for sets of 3d points
 *
 * Can be used for calculation of bounds
 * Doesn't have anything related to particular DisplayObject
 * Renderers can use it to upload data to vertex buffer or to copy data to other buffers
 *
 * @class
 * @memberof PIXI
 */
function ComputedGeometry3d() {
    Geometry3d.call(this);
    this._transformUid = -1;
    this._transformVersion = -1;
    this._geometryUid = -1;
    this._geometryVersion = -1;
}

ComputedGeometry3d.prototype = Object.create(Geometry3d.prototype);
ComputedGeometry3d.prototype.constructor = Geometry3d;
module.exports = ComputedGeometry3d;

ComputedGeometry3d.prototype.applyTransformStatic = function (geometry, transform) {
    if (this._transformUid === transform.uid &&
        this._transformVersion === transform.version &&
        this._geometryUid === geometry.uid &&
        this._geometryVersion === geometry.version) {
        return false;
    }
    this._transformUid = transform.uid;
    this._transformVersion = transform.version;
    this._geometryUid = geometry.uid;
    this._geometryVersion = geometry.version;

    this.applyTransform(geometry, transform);
    return true;
};

ComputedGeometry3d.prototype.applyTransform = function(geometry, transform) {
    this.stride = geometry.stride;
    if (!this.vertices || this.size !== geometry.size) {
        this.size = geometry.size;
    }
    //TODO: may be optimize for case of rotation===0
    this.applyMatrix(geometry, transform.is3d ? transform.matrix3d: transform.matrix2d.toMat4(tempMatrix));
};

ComputedGeometry3d.prototype.applyMatrix = function(geometry, matrix) {
    var vec = tempVec3;
    var out = this.vertices;
    var stride = geometry.stride;
    var vertices = geometry.vertices;
    var is3d = geometry.is3d;
    for (var i = 0, j = 0, n = vertices.length; i < n; i += 3, j += stride) {
        vec[0] = vertices[j];
        vec[1] = vertices[j+1];
        vec[2] = is3d ? vertices[j+2] : 0;
        vec3.transformMat4(vec, vec, matrix);
        out[i] = vec[0];
        out[i+1] = vec[1];
        out[i+2] = vec[2];
    }
    this.version++;
};

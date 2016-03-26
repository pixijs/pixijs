var Geometry2d = require('./Geometry2d');

/**
 * Used by both Meshes and Sprites, mutable storage for sets of 2d points
 *
 * Can be used for calculation of bounds
 * Doesn't have anything related to particular DisplayObject
 * Renderers can use it to upload data to vertex buffer or to copy data to other buffers
 *
 * @class
 * @memberof PIXI
 */
function ComputedGeometry2d() {
    Geometry2d.call(this);
    this._transformUid = -1;
    this._transformVersion = -1;
    this._geometryUid = -1;
    this._geometryVersion = -1;
}

ComputedGeometry2d.prototype = Object.create(Geometry2d.prototype);
ComputedGeometry2d.prototype.constructor = Geometry2d;
module.exports = ComputedGeometry2d;

ComputedGeometry2d.prototype.applyTransformStatic = function (geometry, transform) {
    if (this._transformUid === transform.uid &&
        this._transformVersion === transform.version &&
        this._geometryUid === geometry.uid &&
        this._geometryVersion === geometry.version) {
        //TODO: we need geometry version too
        //no changes
        return false;
    }
    this._transformUid = transform.uid;
    this._transformVersion = transform.version;
    this._geometryUid = geometry.uid;
    this._geometryVersion = geometry.version;

    this.applyTransform(geometry, transform);
    return true;
};

ComputedGeometry2d.prototype.applyTransform = function(geometry, transform) {
    this.stride = geometry.stride;
    if (!this.vertices || this.size !== geometry.size) {
        this.size = geometry.size;
    }
    //TODO: may be optimize for case of rotation===0
    this.applyMatrix(geometry, transform.matrix2d);
};

ComputedGeometry2d.prototype.applyMatrix = function(geometry, matrix) {
    var a = matrix.a;
    var b = matrix.b;
    var c = matrix.c;
    var d = matrix.d;
    var tx = matrix.tx;
    var ty = matrix.ty;

    var out = this.vertices;
    var stride = geometry.stride;
    var vertices = geometry.vertices;
    for (var i = 0, j = 0, n = vertices.length; i < n; i += 2, j += stride) {
        var rawX = vertices[j], rawY = vertices[j + 1];
        out[i] = (a * rawX) + (c * rawY) + tx;
        out[i+1] = (d * rawY) + (b * rawX) + ty;
    }
};

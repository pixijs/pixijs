var Geometry = require('./Geometry');

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
function Geometry2d() {
    Geometry.call(this);
}

Geometry2d.prototype = Object.create(Geometry.prototype);
Geometry2d.prototype.constructor = Geometry;
module.exports = Geometry2d;

Geometry2d.prototype.setRectCoords = function (offset, x1, y1, x2, y2) {
    var vs = this.vertices;
    vs[offset++] = x1;
    vs[offset++] = y1;
    vs[offset++] = x2;
    vs[offset++] = y1;
    vs[offset++] = x2;
    vs[offset++] = y2;
    vs[offset++] = x1;
    vs[offset++] = y2;
    this.version++;
    return offset;
};

Geometry2d.fromBuffers = function (vertices, indices) {
    var geometry = new Geometry2d();
    geometry.vertices = vertices || null;
    geometry.indices = indices || null;
};

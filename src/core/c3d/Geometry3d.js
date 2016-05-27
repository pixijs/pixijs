var Geometry = require('../c2d/Geometry');

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
function Geometry3d() {
    Geometry.call(this);
    this.stride = 3;
}

Geometry3d.prototype = Object.create(Geometry.prototype);
Geometry3d.prototype.constructor = Geometry3d;
module.exports = Geometry3d;

Geometry3d.fromBuffers = function (vertices, indices) {
    var geometry = new Geometry3d();
    geometry.vertices = vertices || null;
    geometry.indices = indices || null;
    return geometry;
};

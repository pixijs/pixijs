/**
 * Mutable storage for sets of N-dimensional points
 * Sometimes contains the indices too
 * Renderers can use it to upload data to vertex buffer or to copy data to other buffers
 *
 * @class
 * @memberof PIXI
 */
function Geometry() {
    this.vertices = null;
    this.indices = null;
    this.stride = 2;
}

Geometry.prototype.setSize = function (verticesCount) {
    this.vertices = new Float32Array(verticesCount * this.stride);
};

Geometry.fromBuffers = function (vertices, indices) {
    var geometry = new Geometry2d();
    geometry.vertices = vertices || null;
    geometry.indices = indices || null;
};

module.exports = Geometry;

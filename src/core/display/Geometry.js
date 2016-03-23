/**
 * Mutable storage for sets of 2d or 3d points
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
    this.is3d = false;
    this.uid = utils.uid();
    this.version = 0;
}

Object.defineProperties(Geometry.prototype, {
    size: {
        get: function () {
            return this.vertices ? (this.vertices.length / this.stride | 0) : 0;
        },
        set: function(verticesCount) {
            if (verticesCount > 0) {
                this.vertices = new Float32Array(verticesCount * this.stride);
            } else {
                this.vertices = null;
            }
        }
    },
    valid: {
        get: function() {
            return this.vertices !== null;
        }
    }
});

module.exports = Geometry;

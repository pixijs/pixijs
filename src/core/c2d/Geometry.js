var math = require('../math'),
    utils = require('../utils');

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
    this.uid = utils.incGeometry();
    this.version = 0;
    this._bounds = new math.Rectangle();
    this._dirtyBounds = -1;
}

Geometry.prototype.getBounds = function () {
    if (this.vertices === null) {
        return math.Rectangle.EMPTY;
    }
    if (this._dirtyBounds !== this.version) {
        this._dirtyBounds = this.version;

        var vertices = this.vertices;
        var minX = vertices[0];
        var maxX = vertices[0];

        var minY = vertices[1];
        var maxY = vertices[1];

        for (var i = this.stride, n = vertices.length; i < n; i += this.stride) {
            if (minX > vertices[i]) {
                minX = vertices[i];
            }
            if (maxX < vertices[i]) {
                maxX = vertices[i];
            }
            if (minY > vertices[i + 1]) {
                minY = vertices[i + 1];
            }
            if (maxY < vertices[i + 1]) {
                maxY = vertices[i + 1];
            }
        }

        var bounds = this._bounds;
        bounds.x = minX;
        bounds.y = minY;
        bounds.width = maxX - minX;
        bounds.height = maxY - minY;
    }
    return this._bounds;
};

Object.defineProperties(Geometry.prototype, {
    size: {
        get: function () {
            return this.vertices ? (this.vertices.length / this.stride | 0) : 0;
        },
        set: function (verticesCount) {
            if (verticesCount > 0) {
                this.vertices = new Float32Array(verticesCount * this.stride);
            } else {
                this.vertices = null;
            }
        }
    },
    valid: {
        get: function () {
            return this.vertices !== null;
        }
    }
});

module.exports = Geometry;

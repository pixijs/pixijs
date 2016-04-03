var Geometry = require('./Geometry'),
    math = require('../math');

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

var tempPolygon = new math.Polygon();

/**
 * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
 *
 * @param point {PIXI.Point} the point to test
 * @return {boolean} the result of the test
 */
Geometry2d.prototype.containsPoint = function(point, useIndices) {
    var vertices = this.vertices;
    var points = tempPolygon.points;
    var i, len;

    var stride = this.stride;
    if (useIndices) {
        var indices = this.indices;
        len = this.indices.length;
        //TODO: inline this.
        for (i=0;i<len;i+=3) {
            var ind0 = indices[i]*stride, ind1 = indices[i+1]*stride, ind2 = indices[i+2]*stride;
            points[0] = vertices[ind0];
            points[1] = vertices[ind0+1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1+1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2+1];
            if (tempPolygon.contains(point.x, point.y)) {
                return true;
            }
        }
    } else {
        len = vertices.length;
        for (i=0;i<len;) {
            points[0] = vertices[i];
            points[1] = vertices[i+1];
            i+=stride;
            points[2] = vertices[i];
            points[3] = vertices[i+1];
            i+=stride;
            points[4] = vertices[i];
            points[5] = vertices[i+1];
            i+=stride;
            if (tempPolygon.contains(point.x, point.y)) {
                return true;
            }
        }
    }
    return false;
};

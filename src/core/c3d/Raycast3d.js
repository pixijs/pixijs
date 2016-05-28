var Raycast2d = require('../c2d/Raycast2d'),
    glMat = require('gl-matrix'),
    vec3 = glMat.vec3,
    mat4 = glMat.mat4;

var tempMatrix = mat4.create(),
    tempVec1 = vec3.create(),
    tempVec2 = vec3.create();

function Raycast3d() {
    Raycast2d.call(this);
    this.ray = [vec3.create(), vec3.create()];
    this.is3d = true;
}

Raycast3d.prototype = Object.create(Raycast2d.prototype);

Raycast3d.prototype.constructor = Raycast3d;
module.exports = Raycast3d;

Raycast3d.prototype.childApplyTransform = function(child, transform) {
    if (!child || !child.is3d) {
        child = new Raycast3d();
    }
    return transform.updateRaycast(child, this);
};

Raycast3d.prototype.applyTransform = function(raycast, transform) {
    this.intersects = false;

    var ray0 = raycast.is3d ? raycast.ray[0] : vec3.set(tempVec1, raycast.x, raycast.y, 1);
    var ray1 = raycast.is3d ? raycast.ray[1] : vec3.set(tempVec2, raycast.x, raycast.y, 0);

    var wt = transform.is3d ? transform.getInverse() : transform.matrix2d.invertMat4(tempMatrix);
    vec3.transformMat4(this.ray[0], ray0, wt);
    vec3.transformMat4(this.ray[1], ray1, wt);
    var eps = glMat.glMatrix.EPSILON;
    var dz = this.ray[0][2] - this.ray[1][2];
    if (dz > -eps && dz < eps) {
        this.valid = false;
    } else {
        var t = - this.ray[0][2] / (this.ray[1][2] - this.ray[0][2]);
        if (t < -eps) {
            this.valid = false;
        } else {
            this.valid = true;
            this._point.x = t * (this.ray[1][0] - this.ray[0][0]) + this.ray[0][0];
            this._point.y = t * (this.ray[1][1] - this.ray[0][1]) + this.ray[0][1];
        }
    }
};

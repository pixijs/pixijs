/**
 * Created by Liza on 07.03.2016.
 */

var glMat = require('gl-matrix'),
    tempPoint3d = glMat.vec3.create();

function AABB(min, max)
{
    this.min = min || glMat.vec3.create();
    this.max = max || glMat.vec3.create();
}

AABB.prototype.constructor = AABB;
module.exports = AABB;

AABB.prototype.clone = function ()
{
    return new AABB(glMat.vec3.clone(this.min), glMat.vec3.clone(this.max));
};

AABB.prototype.getBounds2d = function(out, perspectiveMatrix) {
    tempPoint3d.x = min.x;
};

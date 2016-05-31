var Frustrum = require('./Frustrum'),
    Transform3d = require('./Transform3d'),
    glMat = require('gl-matrix'),
    mat4 = glMat.mat4,
    vec3 = glMat.vec3,
    quat = glMat.quat;

var tempMatrix = mat4.create(),
    tempVec = vec3.create();


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @extends PIXI.Transform3d
 * @memberof PIXI
 */
function ProjectionTransform3d()
{
    Transform3d.call(this, true);
    this.frustrum = new Frustrum();
    this.euler._sign = -1;
    this._frustrumVersion = 0;
    this.eyeVec = vec3.create();
}

ProjectionTransform3d.prototype = Object.create(Transform3d.prototype);
ProjectionTransform3d.prototype.constructor = Transform3d;

ProjectionTransform3d.prototype.update = function ()
{
    this.euler.update();
    if (this.version === this._dirtyVersion &&
        this._eulerVersion === this.euler.version &&
        this._frustrumVersion === this.frustrum.version) {
        return false;
    }
    this.version = ++this._dirtyVersion;
    this._eulerVersion = this.euler.version;
    this._frustrumVersion = this.frustrum.version;

    var matrix = this.matrix3d;
    mat4.identity(matrix);
    matrix[12] = this.pivot.x;
    matrix[13] = this.pivot.y;
    matrix[14] = this.pivot.z;

    var focus = this.frustrum._focus;
    var near = this.frustrum._near;
    var far = this.frustrum._far;
    if (focus || near || far) {
        mat4.identity(tempMatrix);
        tempMatrix[10] = 1.0 / (far - near);
        tempMatrix[14] = (focus - near) / (far - near);
        tempMatrix[11] = 1.0 / focus;
        mat4.multiply(matrix, matrix, tempMatrix);
    }

    mat4.fromQuat(tempMatrix, this.euler.quaternion);
    mat4.multiply(matrix, matrix, tempMatrix);

    var eyeVec = this.eyeVec;
    vec3.set(eyeVec, 0, 0, -focus);
    quat.invert(tempMatrix, this.euler.quaternion);
    mat4.fromQuat(tempMatrix, tempMatrix);
    vec3.transformMat4(eyeVec, eyeVec, tempMatrix);

    tempVec[0] = 1.0 / this.scale.x;
    tempVec[1] = 1.0 / this.scale.y;
    tempVec[2] = 1.0 / this.scale.z;
    mat4.scale(matrix, matrix, tempVec);
    vec3.multiply(eyeVec, eyeVec, tempVec);

    tempVec[0] = -this.position.x;
    tempVec[1] = -this.position.y;
    tempVec[2] = -this.position.z;
    mat4.translate(matrix, matrix, tempVec);
    vec3.subtract(eyeVec, eyeVec, tempVec);

    return true;
};

module.exports = ProjectionTransform3d;

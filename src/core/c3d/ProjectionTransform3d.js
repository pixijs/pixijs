var Frustrum = require('./Frustrum'),
    Transform3d = require('./Transform3d'),
    glMat = require('gl-matrix'),
    mat4 = glMat.mat4;

var tempMatrix = mat4.create();


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
    this._frustrumVersion = 0;
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

    tempMatrix[0] = this.position.x;
    tempMatrix[1] = this.position.y;
    tempMatrix[2] = this.position.z;

    mat4.fromRotationTranslation(matrix, this.euler.quaternion, tempMatrix);

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

    tempMatrix[0] = this.scale.x;
    tempMatrix[1] = this.scale.y;
    tempMatrix[2] = this.scale.z;
    mat4.scale(matrix, matrix, tempMatrix);

    tempMatrix[0] = -this.pivot.x;
    tempMatrix[1] = -this.pivot.y;
    tempMatrix[2] = -this.pivot.z;
    mat4.translate(matrix, matrix, tempMatrix);

    return true;
};

module.exports = ProjectionTransform3d;

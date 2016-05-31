var Transform2d = require('./Transform2d');


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @extends PIXI.Transform2d
 * @memberof PIXI
 */
function ProjectionTransform2d(isStatic)
{
    Transform2d.call(this, isStatic);
}

ProjectionTransform2d.prototype = Object.create(Transform2d.prototype);
ProjectionTransform2d.prototype.constructor = ProjectionTransform2d;

ProjectionTransform2d.prototype.straightUpdate = Transform2d.prototype.update;
ProjectionTransform2d.prototype.update = function ()
{
    if (this.straightUpdate()) {
        var lt = this.matrix2d;
        lt.invert();
        return true;
    }
    return false;
};

module.exports = ProjectionTransform2d;

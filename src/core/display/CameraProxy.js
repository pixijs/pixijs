var ContainerProxy = require('./ContainerProxy'),
    Camera2d = require('./Camera2d'),
    ComputedTransform2d = require('../c2d/ComputedTransform2d');

/**
 * Camera object, stores everything in `projection` instead of `transform`
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
function CameraProxy(original)
{
    ContainerProxy.call(this, original);

    this.worldProjection = new ComputedTransform2d();
}

// constructor
CameraProxy.prototype = Object.create(ContainerProxy.prototype);
CameraProxy.prototype.constructor = CameraProxy;
module.exports = CameraProxy;

Object.defineProperties(CameraProxy.prototype, {
    projection: {
        get: function() {
            return this.original.projection;
        }
    }
});

CameraProxy.prototype.displayObjectUpdateTransform = Camera2d.prototype.displayObjectUpdateTransform;

/**
 * Proxy of a Proxy of a Camera. You super-perverted bastard!
 * @return {PIXI.ContainerProxy}
 */
CameraProxy.prototype.createProxy = function() {
    return new CameraProxy(this);
};

/**
 * Proxy of a Camera. You perverted bastard!
 * @return {PIXI.ContainerProxy}
 */
Camera2d.prototype.createProxy = function() {
    return new CameraProxy(this);
};

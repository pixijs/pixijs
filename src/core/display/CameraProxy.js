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

    this._displayList = original._displayList;

    this._displayListFlag = original._displayListFlag;

    this.enableDisplayList = original.enableDisplayList;
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

CameraProxy.prototype.updateTransform = Camera2d.prototype.updateTransform;

CameraProxy.prototype.containerRenderWebGL = Camera2d.prototype.containerRenderWebGL;
CameraProxy.prototype.containerRenderCanvas = Camera2d.prototype.containerRenderCanvas;

CameraProxy.prototype.renderWebGL = Camera2d.prototype.renderWebGL;
CameraProxy.prototype.renderCanvas = Camera2d.prototype.renderCanvas;
/**
 * Proxy of a Proxy of a Camera. You super-perverted bastard!
 * @return {PIXI.CameraProxy}
 */
CameraProxy.prototype.createProxy = function() {
    return new CameraProxy(this);
};

/**
 * Proxy of a Camera. You perverted bastard!
 * @return {PIXI.CameraProxy}
 */
Camera2d.prototype.createProxy = function() {
    return new CameraProxy(this);
};

var DisplayObjectProxy = require('./DisplayObjectProxy'),
    Container = require('./Container');

/**
 * The base class for projections - they can be used with multiple cameras
 *
 * @class
 * @extends PIXI.DisplayObjectProxy
 * @memberof PIXI
 */
function ContainerProxy(original)
{
    DisplayObjectProxy.call(this, original);

    /**
     * The array of children of this proxy container, contains proxies of original container children.
     *
     * @member {PIXI.DisplayObjectProxy[]}
     * @readonly
     */
    this.children = [];
}

// constructor
ContainerProxy.prototype = Object.create(DisplayObjectProxy.prototype);
ContainerProxy.prototype.constructor = ContainerProxy;
module.exports = ContainerProxy;

Object.defineProperties(ContainerProxy.prototype, {
    //TODO: do something about Container _width and _height
});

/**
 * Make a proxy object, for extra camera projections
 * @return {PIXI.ContainerProxy}
 */
Container.prototype.createProxy = function() {
    return new ContainerProxy(this);
};

ContainerProxy.prototype.updateTransform = Container.prototype.updateTransform;

ContainerProxy.prototype.containerUpdateTransform = Container.prototype.updateTransform;

ContainerProxy.prototype._getChildBounds = Container.prototype._getChildBounds;

ContainerProxy.prototype.getBounds = Container.prototype.getBounds;

ContainerProxy.prototype.containerGetBounds = Container.prototype.getBounds;

ContainerProxy.prototype.getLocalBounds = Container.prototype.getLocalBounds;

ContainerProxy.prototype.renderWebGL = Container.prototype.renderWebGL;

ContainerProxy.prototype.renderCanvas = Container.prototype.renderCanvas;

ContainerProxy.prototype._renderWebGL = function(renderer) {
    this.swapContext();
    this.original._renderWebGL(renderer);
    this.swapContext();
};

ContainerProxy.prototype._renderCanvas = function(renderer) {
    this.swapContext();
    this.original._renderCanvas(renderer);
    this.swapContext();
};

/**
 * Make a proxy object, for extra camera projections. Original createProxy() will be called
 * @return {PIXI.ContainerProxy}
 */
ContainerProxy.prototype.createProxy = function() {
    return new ContainerProxy(this);
};

/**
 * Destroys the container
 * @param [destroyChildren=false] {boolean} if set to true, all the children will have their destroy method called as well
 */
ContainerProxy.prototype.destroy = Container.prototype.destroy;

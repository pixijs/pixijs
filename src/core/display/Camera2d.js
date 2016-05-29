var Container = require('./Container'),
    Transform2d = require('../c2d/Transform2d'),
    Geometry2d = require('../c2d/Geometry2d'),
    ComputedGeometry2d = require('../c2d/ComputedGeometry2d'),
    ComputedTransform2d = require('../c2d/ComputedTransform2d'),
    utils = require('../utils'),
    math = require('../math'),
    tempMatrix = new math.Matrix();

/**
 * Camera object, stores everything in `projection` instead of `transform`
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
function Camera2d() {
    Container.call(this);

    /**
     * Projection, for camera
     * @type {PIXI.Transform2d}
     */
    this.projection = null;

    /**
     * based on projection and computedTransform
     * @type {null}
     */
    this.computedProjection = null;

    /**
     * List of proxies, hashmap
     * @type {Object[]}
     */
    this.proxyCache = [{}, {}];

    this.initProjection();

    /**
     * Calculate z-order to make a displaylist
     * @member {Function}
     */
    this.onZOrder = null;

    /**
     * Display list
     * @type {Array}
     * @Private
     */
    this._displayList = [];

    /**
     * Enable display list, sort elements by z-index, z-order and updateOrder
     * @type {boolean}
     */
    this.enableDisplayList = false;

    this.displayListSort = function (a, b) {
        if (a.zIndex !== b.zIndex) {
            return a.zIndex - b.zIndex;
        }
        if (a.zOrder !== b.zOrder) {
            return b.zOrder - a.zOrder;
        }
        return a.updateOrder - b.updateOrder;
    };

    /**
     * viewport
     * @type {boolean}
     */
    this.viewport = new math.Rectangle();

    //TODO: make viewport local geometry!

    /**
     * auto-updates viewport rectangle of the camera
     * @type {boolean}
     */
    this.autoUpdateViewport = true;

    /**
     * Enables culling by rectangle bounds
     * @type {boolean}
     */
    this.enableBoundsCulling = false;

    /**
     * which container is used for culling, may be its something inside camera
     * if null, camera will apply culling to all childrens
     * @type {Container}
     */
    this.boundsCullingContainer = null;

    this._viewportGeom = new Geometry2d();
    this._viewportGeom.size = 4;
    this._invProjectedViewport = new ComputedGeometry2d();
    this._invProjectedViewport.size = 4;
}

Object.defineProperties(Camera2d.prototype, {
    /**
     * origin is something like pivot of container
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    origin: {
        get: function () {
            return this.projection.pivot;
        },
        set: function (value) {
            this.projection.pivot.set(value);
        }
    },
    originRotation: {
        get: function () {
            return this.projection.rotation;
        },
        set: function (value) {
            this.projection.rotation = value;
        }
    }
});

// constructor
Camera2d.prototype = Object.create(Container.prototype);
Camera2d.prototype.constructor = Camera2d;
module.exports = Camera2d;

Camera2d.prototype.initTransform = function () {
    this.displayObjectInitTransform(true);
};

Camera2d.prototype.initProjection = function () {
    this.projection = new Transform2d(true);
    this.worldProjection = new ComputedTransform2d(true);
};

Camera2d.prototype.updateTransform = function () {
    if (!this.visible) {
        return;
    }

    this.updateOrder = utils.incUpdateOrder();
    this.displayOrder = 0;
    this._currentBounds = null;

    var parentWorldProjection = null;

    this.transform.update();
    if (this.dontInheritTransform) {
        this.dontInheritTransform = false;
        this.computedTransform = this.transform.updateSingleChild(this.computedTransform);
    } else {
        this.computedTransform = this.parent.computedTransform.updateChildTransform(this.computedTransform, this.transform);
    }

    this.projection.update();
    this.computedProjection = this.computedTransform.updateChildTransform(this.computedProjection, this.projection);

    // multiply the alphas..
    if (this.parent) {
        //projection attributes
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
        parentWorldProjection = this.parent.worldProjection;
    } else {
        this.worldAlpha = this.alpha;
        parentWorldProjection = null;
    }

    if (parentWorldProjection) {
        this.worldProjection = parentWorldProjection.updateChildTransform(this.worldProjection, this.computedProjection);
    } else {
        this.worldProjection = this.computedProjection.updateSingleChild(this.worldProjection);
    }

    for (var i = 0, j = this.children.length; i < j; ++i) {
        if (this.children[i].visible) {
            this.children[i].dontInheritTransform = true;
            this.children[i].updateTransform();
        }
    }
    this.updatePostOrder = utils.incUpdateOrder();

    if (this.enableBoundsCulling) {
        this.updateViewportCulling();
    }
    this.emit('culling');
    if (this.enableDisplayList) {
        this.updateDisplayList();
    }
};

Camera2d.prototype._proxyContainer = function (containerFrom, containerTo) {
    var proxyCache = this.proxyCache[0];
    var newProxyCache = this.proxyCache[1];

    var ch1 = containerFrom.children;
    var ch2 = containerTo.children;
    ch2.length = 0;
    for (var i = 0; i < ch1.length; i++) {
        var c1 = ch1[i];
        var c2 = proxyCache[c1.uid] || c1.createProxy();
        newProxyCache[c1.uid] = c2;
        ch2.push(c2);
        c2.parent = containerTo;
        //its a container!
        if (c2.children) {
            this._proxyContainer(c1, c2);
        }
    }
};

Camera2d.prototype._proxySwapBuffer = function () {
    this.proxyCache[0] = this.proxyCache[1];
    this.proxyCache[1] = {};
};

Camera2d.prototype.proxyContainer = function (containerFrom, containerTo) {
    if (!containerTo) {
        containerTo = this;
    }
    this._proxyContainer(containerFrom, containerTo);
    this._proxySwapBuffer();
};

/*Camera2d.prototype.proxySwapContext = function() {
 var pc = this.proxyCache[0];
 for (var key in pc) {
 var val = pc[key];
 val.swapContext();
 }
 };*/

Camera2d.prototype.containerRenderWebGL = Container.prototype.renderWebGL;
Camera2d.prototype.containerRenderCanvas = Container.prototype.renderCanvas;

Camera2d.prototype.renderWebGL = function (renderer) {
    if (this.autoUpdateViewport) {
        this.viewport.x = 0;
        this.viewport.y = 0;
        this.viewport.width = renderer.width / renderer.resolution;
        this.viewport.height = renderer.height / renderer.resolution;
    }
    if (this.enableDisplayList) {
        var list = this._displayList;
        for (var i = 0; i < list.length; i++) {
            if (list[i].displayFlag) {
                list[i].renderWebGL(renderer);
            } else {
                list[i].displayOrder = utils.incDisplayOrder();
                list[i]._renderWebGL(renderer);
            }
        }
    } else {
        this.containerRenderWebGL(renderer);
    }
};

Camera2d.prototype.renderCanvas = function (renderer) {
    if (this.autoUpdateViewport) {
        this.viewport.x = 0;
        this.viewport.y = 0;
        this.viewport.width = renderer.width;
        this.viewport.height = renderer.height;
    }
    if (this.enableDisplayList) {
        var list = this._displayList;
        for (var i = 0; i < list.length; i++) {
            if (list[i].displayFlag) {
                list[i].renderCanvas(renderer);
            } else {
                list[i].displayOrder = utils.incDisplayOrder();
                list[i]._renderCanvas(renderer);
            }
        }
    } else {
        this.containerRenderCanvas(renderer);
    }
};

Camera2d.prototype._addInList = function (container, parentZIndex, parentZOrder) {
    if (!container.visible || !container.renderable) {
        return;
    }
    var list = this._displayList;
    container.displayOrder = list.length;
    if (container.inheritZIndex) {
        container._zIndex = parentZIndex;
        container.zOrder = parentZOrder;
    } else {
        if (this.onZOrder) {
            this.onZOrder(container);
        }
    }
    list.push(container);
    if (container._mask || container._filters && container._filters.length) {
        container.displayFlag = 1;
    } else {
        var children = container.children;
        if (children) {
            container.displayFlag = 0;
            for (var i = 0; i < children.length; i++) {
                this._addInList(children[i], container.zIndex, container.zOrder);
            }
        } else {
            container.displayFlag = 2;
        }
    }
};

Camera2d.prototype.updateDisplayList = function () {
    var list = this._displayList;
    list.length = 0;
    var children = this.children;
    for (var i = 0; i < children.length; i++) {
        this._addInList(children[i], 0, 0);
    }
    list.sort(this.displayListSort);
};

Camera2d.prototype.updateBoundsCulling = function (viewportBounds, container) {
    var x1 = viewportBounds.x, x2 = viewportBounds.x + viewportBounds.width;
    var y1 = viewportBounds.y, y2 = viewportBounds.y + viewportBounds.height;
    var EMPTY = math.Rectangle.EMPTY;

    var self = this;

    function culler(element) {
        var s = element.getComputedBounds();
        var b = element.renderable =
            element === self ||
            s !== EMPTY &&
            (s.x + s.width >= x1 && s.x <= x2 &&
            s.y + s.height >= y1 && s.y <= y2);

        if (!b) {
            return false;
        }
        var children = element.children;
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            if (!c.visible) {
                continue;
            }
            culler(c);
        }
        return true;
    }

    culler(container || this.boundsCullingContainer || this);
};

Camera2d.prototype.updateViewportCulling = function (viewport, container) {
    viewport = viewport || this.viewport;
    this._viewportGeom.setRectCoords(0, viewport.x, viewport.y, viewport.x + viewport.width, viewport.y + viewport.height);
    this.projection.matrix2d.copy(tempMatrix);
    tempMatrix.invert();
    this._invProjectedViewport.applyMatrix(this._viewportGeom, tempMatrix);
    var viewportBounds = this._invProjectedViewport.getBounds();
    this.updateBoundsCulling(viewportBounds, container);
};

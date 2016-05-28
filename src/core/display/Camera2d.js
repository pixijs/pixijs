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
function Camera2d()
{
    Container.call(this);

    /**
     * Projection, for camera
     * @type {PIXI.Transform2d}
     */
    this.projection = null;

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

    this.displayListSort = function(a, b) {
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

// constructor
Camera2d.prototype = Object.create(Container.prototype);
Camera2d.prototype.constructor = Camera2d;
module.exports = Camera2d;

Camera2d.prototype.initTransform = function() {
    this.displayObjectInitTransform(true);
};

Camera2d.prototype.initProjection = function() {
    this.projection = new Transform2d(true);
    this.worldProjection = new ComputedTransform2d(true);
};

Object.defineProperties(Camera2d.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this.projection.position.x;
        },
        set: function (value)
        {
            this.projection.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    y: {
        get: function ()
        {
            return this.projection.position.y;
        },
        set: function (value)
        {
            this.projection.position.y = value;
        }
    },

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    position: {
        get: function()
        {
            return this.projection.position;
        },
        set: function(value) {
            this.projection.position.copy(value);
        }
    },

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    scale: {
        get: function() {
            return this.projection.scale;
        },
        set: function(value) {
            this.projection.scale.copy(value);
        }
    },

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    pivot: {
        get: function() {
            return this.projection.pivot;
        },
        set: function(value) {
            this.projection.pivot.copy(value);
        }
    },

    /**
     * The skew factor for the object in radians.
     *
     * @member {PIXI.Point}
     */
    skew: {
        get: function() {
            return this.projection.skew;
        },
        set: function(value) {
            this.projection.skew.copy(value);
        }
    },

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    rotation: {
        get: function ()
        {
            return this.projection.rotation;
        },
        set: function (value)
        {
            this.projection.rotation = value;
        }
    }
});


Camera2d.prototype.displayObjectUpdateTransform = function() {
    this._currentBounds = null;
    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    //Transform will be Identity in most cases, and we really can remove these two lines. I leave it because there will be only a few cameras
    this.transform.update();
    this.computedTransform = this.transform.makeComputedTransform(this.computedTransform);

    //Projection combines parent transform and its worldProjection
    this.projection.update();
    if (!this.parent) {
        this.worldProjection = this.projection.makeComputedTransform(this.worldProjection);
    } else {
        this.worldProjection = this.parent.updateProjectedTransform().updateChildTransform(this.worldProjection, this.projection);
    }
    return this.computedTransform;
};

Camera2d.prototype.updateTransform = function() {
    this.containerUpdateTransform();
    if (this.enableBoundsCulling) {
        this.updateViewportCulling();
    }
    this.emit('culling');
    if (this.enableDisplayList) {
        this.updateDisplayList();
    }
};

Camera2d.prototype._proxyContainer = function(containerFrom, containerTo) {
    var proxyCache = this.proxyCache[0];
    var newProxyCache = this.proxyCache[1];

    var ch1 = containerFrom.children;
    var ch2 = containerTo.children;
    ch2.length = 0;
    for (var i=0;i<ch1.length;i++) {
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

Camera2d.prototype._proxySwapBuffer = function() {
    this.proxyCache[0] = this.proxyCache[1];
    this.proxyCache[1] = {};
};

Camera2d.prototype.proxyContainer = function(containerFrom, containerTo) {
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

Camera2d.prototype.renderWebGL = function(renderer) {
    if (this.autoUpdateViewport) {
        this.viewport.x = 0;
        this.viewport.y = 0;
        this.viewport.width = renderer.width / renderer.resolution;
        this.viewport.height = renderer.height / renderer.resolution;
    }
    if (this.enableDisplayList) {
        var list = this._displayList;
        for (var i=0;i<list.length;i++) {
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

Camera2d.prototype.renderCanvas = function(renderer) {
    if (this.autoUpdateViewport) {
        this.viewport.x = 0;
        this.viewport.y = 0;
        this.viewport.width = renderer.width;
        this.viewport.height = renderer.height;
    }
    if (this.enableDisplayList) {
        var list = this._displayList;
        for (var i=0;i<list.length;i++) {
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

Camera2d.prototype._addInList = function(container, parentZIndex, parentZOrder) {
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

Camera2d.prototype.updateDisplayList = function() {
    var list = this._displayList;
    list.length = 0;
    var children = this.children;
    for (var i=0;i<children.length;i++) {
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

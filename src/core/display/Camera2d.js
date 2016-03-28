var Container = require('./Container'),
    Transform2d = require('../c2d/Transform2d'),
    ComputedTransform2d = require('../c2d/ComputedTransform2d');

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

Camera2d.prototype.proxySwapContext = function() {
    var pc = this.proxyCache[0];
    for (var key in pc) {
        var val = pc[key];
        val.swapContext();
    }
};

Camera2d.prototype.containerRenderWebGL = Container.prototype.renderWebGL;
Camera2d.prototype.containerRenderCanvas = Container.prototype.renderCanvas;

Camera2d.prototype.renderWebGL = function(renderer) {
    this.proxySwapContext();
    this.containerRenderWebGL(renderer);
    this.proxySwapContext();
};

Camera2d.prototype.renderCanvas = function(renderer) {
    this.proxySwapContext();
    this.containerRenderCanvas(renderer);
    this.proxySwapContext();
};

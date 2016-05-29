var Camera2d = require('../display/Camera2d'),
    Transform3d = require('./Transform3d'),
    ComputedTransform3d = require('./ComputedTransform3d'),
    ProjectionTransform3d = require('./ProjectionTransform3d'),
    math = require('../math');

/**
 * Camera object, stores everything in `projection` instead of `transform`
 * allows to use 3d frustrum
 *
 * @class
 * @extends PIXI.Camera2d
 * @memberof PIXI
 */
function Camera3d()
{
    Camera2d.call(this);
}

// constructor
Camera3d.prototype = Object.create(Camera2d.prototype);
Camera3d.prototype.constructor = Camera3d;
module.exports = Camera3d;

Camera3d.prototype.initTransform = function() {
    this.transform = new Transform3d(true);
    this.computedTransform = new ComputedTransform3d();
};

Camera3d.prototype.initProjection = function() {
    this.projection = new ProjectionTransform3d(true);
    this.worldProjection = new ComputedTransform3d(true);
};

Object.defineProperties(Camera3d.prototype, {
    /**
     * The position of the displayObject on the z axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    z: {
        get: function ()
        {
            return this.projection.position.z;
        },
        set: function (value)
        {
            this.projection.position.z = value;
        }
    },

    /**
     * The euler angles of projection
     *
     * @member {number}
     */
    originEuler: {
        get: function ()
        {
            return this.projection.euler;
        },
        set: function (value)
        {
            this.projection.euler.copy(value);
        }
    },
    frustrum: {
        get: function() {
            return this.projection.frustrum;
        }
    }
});

Camera3d.prototype.easyPerspective = function(renderer, focus, near, far) {
    var w = renderer.width / renderer.resolution, h = renderer.height / renderer.resolution;
    this.centralPerspective(0, w, 0, h, focus, near, far);
};

Camera3d.prototype.centralPerspective = function(left, right, top, bottom, focus, near, far) {
    this.viewport.x = left;
    this.viewport.width = right-left;
    this.viewport.y = top;
    this.viewport.height = bottom-top;

    var cx = (right+left)/2;
    var cy = (top+bottom)/2;
    this.projection.position.set(cx, cy);
    this.projection.frustrum.set(focus || 0, near || 0, far || 0);
};

Camera3d.prototype.updateBoundsCulling = function (viewportBounds, container) {
    var x1 = viewportBounds.x, x2 = viewportBounds.x + viewportBounds.width;
    var y1 = viewportBounds.y, y2 = viewportBounds.y + viewportBounds.height;
    var EMPTY = math.Rectangle.EMPTY;

    var self = this;
    function culler(element) {
        var s = element.getBounds();
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

Camera3d.prototype.updateViewportCulling = function (viewport, container) {
    viewport = viewport || this.viewport;
    this.updateBoundsCulling(viewport, container);
};

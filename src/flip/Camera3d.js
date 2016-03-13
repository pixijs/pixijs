var core = require('../core'),
    glMat = require('gl-matrix'),
    vec3 = glMat.vec3,
    math3d = require('./math'),
    Container3d = require('./Container3d'),

    temp3dTransform  = glMat.mat4.create(),
    tempQuat         = glMat.quat.create(),
    tempPoint        = new core.Point(),
    tempPoint3d      = glMat.mat3.create();


/**
 * The Camera object
 *
 * @class Camera3d
 * @extends Container3d
 * @namespace PIXI.flip
 */
function Camera3d()
{
    Container3d.call(this);

    this._near = 0;

    this._far = 1;

    this._focus = 0;

    this.viewport = new core.Rectangle(0, 0, 1, 1);

    this.isPerspective = false;

    this.enableSphereCulling = false;
    this.enableBoundsCulling = false;
}


// constructor
Camera3d.prototype = Object.create(Container3d.prototype);
Camera3d.prototype.constructor = Camera3d;

Object.defineProperties(Camera3d.prototype, {
    /**
     * @member {number}
     * @memberof PIXI.flip.Container3d#
     */
    rotation: {
        get: function () {
            return this.euler.z;
        },
        set: function (value) {
            this.euler.z = value;
        }
    }
});

Camera3d.prototype.easyPerspective = function(renderer, focus, near, far) {
    var w = renderer.width, h = renderer.height;
    this.position.x = w/2;
    this.position.y = h/2;
    this.centralPerspective(0, w, 0, h, focus, near, far);
};

Camera3d.prototype.centralPerspective = function(left, right, top, bottom, focus, near, far) {
    this.viewport.x = left;
    this.viewport.width = right-left;
    this.viewport.y = top;
    this.viewport.height = bottom-top;
    var cx = (right+left)/2;
    var cy = (top+bottom)/2;
    this._near = near;
    this._far = far;
    this._focus = focus;

    var out = this.projectionMatrix = (this.projectionMatrix || glMat.mat4.create());
    glMat.mat4.identity(out);
    tempPoint3d[0] = cx;
    tempPoint3d[1] = cy;
    tempPoint3d[2] = 0;
    glMat.mat4.translate(out, out, tempPoint3d);
    glMat.mat4.identity(temp3dTransform);
    temp3dTransform[10] = 1.0 / (far - near);
    temp3dTransform[14] = (focus - near) / (far - near);
    temp3dTransform[11] = 1.0 / focus;
    glMat.mat4.multiply(out, out, temp3dTransform);
    tempPoint3d[0] = -cx;
    tempPoint3d[1] = -cy;
    glMat.mat4.translate(out, out, tempPoint3d);
};

Camera3d.prototype.sphereCulling = function (elem) {
    if (!this.projectionMatrix) return;
    var viewport = this.viewport;
    var x1 = viewport.x, x2 = viewport.x + viewport.width;
    var y1 = viewport.y, y2 = viewport.y + viewport.height;
    var cx = (x1+x2)/2;
    var cy = (y1+y2)/2;
    var focus = this._focus, far = this._far, near = this._near;
    var z1 = near - focus, z2 = far - focus;
    var EMPTY = math3d.Sphere.EMPTY;

    var n1 = vec3.fromValues(-focus, 0, x1-cx);
    var n2 = vec3.fromValues(focus, 0, -x2+cx);
    var n3 = vec3.fromValues(0, -focus, y1-cy);
    var n4 = vec3.fromValues(0, focus, -y2+cy);
    vec3.normalize(n1, n1);
    vec3.normalize(n2, n2);
    vec3.normalize(n3, n3);
    vec3.normalize(n4, n4);

    function culler(element) {
        var s = element.getSphereBounds();
        var v = s.v;
        var r = s.r;
        var b = element.renderable =
            s != EMPTY &&
            (v[2] + r >= z1 && v[2] - r <= z2 &&
            (v[0] - x1) * n1[0] + n1[2] * v[2] < r &&
            (v[0] - x2) * n2[0] + n2[2] * v[2] < r &&
            (v[1] - y1) * n3[1] + n3[2] * v[2] < r &&
            (v[1] - y2) * n4[1] + n4[2] * v[2] < r &&
            true);

        if (!b) return false;
        var children = element.children;
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            if (!c.visible || !c.is3d) continue;
            culler(c);
        }
        return true;
    }

    culler(elem || this);
};

Camera3d.prototype.boundsCulling = function (elem) {
    if (!this.projectionMatrix) return;
    var viewport = this.viewport;
    var x1 = viewport.x, x2 = viewport.x + viewport.width;
    var y1 = viewport.y, y2 = viewport.y + viewport.height;
    var EMPTY = core.Rectangle.EMPTY;

    function culler(element) {
        var s = element.getBounds();
        var b = element.renderable =
            s != EMPTY &&
            (s.x + s.width >= x1 && s.x <= x2 &&
                s.y + s.height >= y1 && s.y <= y2);

        if (!b) return false;
        var children = element.children;
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            if (!c.visible) continue;
            culler(c);
        }
        return true;
    }

    culler(elem || this);
};

Camera3d.prototype.updateTransform3d = function() {
    this.containerUpdateTransform3d();
    if (this.enableSphereCulling) {
        this.sphereCulling(this);
    } else {
        if (this.enableBoundsCulling) {
            this.boundsCulling(this);
        }
    }
};

module.exports = Camera3d;

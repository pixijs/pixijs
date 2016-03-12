var core = require('../core'),
    Container3d = require('./Container3d'),
    glMat = require('gl-matrix'),
    math3d = require('./math');
/**
 * The Mesh object is the base for all textured objects that are rendered to the screen
 *
 * A Mesh can be created directly from an image like this:
 *
 * ```js
 * var Mesh = new Mesh.fromImage('assets/image.png');
 * ```
 *
 * @class Mesh
 * @extends Container
 * @namespace PIXI
 * @param texture {Texture} The texture for this Mesh
 */
function Mesh3d(texture, vertices, uvs, indices, drawMode)
{
    this.euler = new math3d.Euler(0, 0, 0);
    core.mesh.Mesh.call(this, texture, vertices, uvs, indices, drawMode);

    // pixin some new 3d magic!
    this.position = new math3d.Point3d(0, 0, 0);
    this.scale = new math3d.Point3d(1, 1, 1);

    this.worldTransform3d = glMat.mat4.create();

    this.is3d = true;
    this.isCulled3d = false;
    this._bounds2 = new core.Rectangle();
    this.projectionMatrix = null;
    this.worldProjectionMatrix = null;
}

Object.defineProperties(Mesh3d.prototype, {
    /**
     * @member {number}
     * @memberof PIXI.flip.Mesh3d#
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

// constructor
Mesh3d.prototype = Object.create(core.mesh.Mesh.prototype);
Mesh3d.prototype.constructor = Mesh3d;

Mesh3d.prototype.updateTransform = Container3d.prototype.updateTransform;
Mesh3d.prototype.updateTransform3d = Container3d.prototype.updateTransform3d;

Mesh3d.prototype.renderWebGL = Container3d.prototype.renderWebGL;

Mesh3d.prototype._renderWebGL3d = function() {
    renderer.setObjectRenderer(renderer.plugins.mesh3d);
    renderer.plugins.mesh3d.render(this);
};

Mesh3d.prototype.getBounds = function (matrix)
{
    if(!this._currentBounds)
    {
        var worldTransform = matrix || this.worldTransform3d;

        var b = math3d.makeRectBoundsMesh(this._bounds2, worldTransform, this.worldProjectionMatrix, this.vertices);
        if (b === core.Rectangle.EMPTY)
            return this._currentBounds = b;

        if(this.children.length)
        {
            b.enlarge(this.containerGetBounds());
        }
        this._currentBounds = b;
    }

    return this._currentBounds;
};

module.exports = Mesh3d;

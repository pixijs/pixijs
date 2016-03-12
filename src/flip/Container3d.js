var core = require('../core'),
    glMat = require('gl-matrix'),
    math3d = require('./math');


/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class Sprite
 * @extends Container
 * @namespace PIXI
 * @param texture {Texture} The texture for this sprite
 */
function Container3d()
{
    this.euler = new math3d.Euler(0, 0, 0);
    core.Container.call(this);

    // pixin some new 3d magic!
    this.position = new math3d.Point3d(0, 0, 0);
    this.scale = new math3d.Point3d(1, 1, 1);
    this.pivot = new math3d.Point3d(0, 0, 0);

    this.worldTransform3d = glMat.mat4.create();

    this.is3d = true;
    this.isCulled3d = false;
    this.projectionMatrix = null;
    this.worldProjectionMatrix = null;
}


// constructor
Container3d.prototype = Object.create(core.Container.prototype);
Container3d.prototype.constructor = Container3d;

Object.defineProperties(Container3d.prototype, {
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

Container3d.prototype.updateTransform = function()
{
    if(this.parent.convertFrom2dTo3d)
    {
        this.parent.convertFrom2dTo3d(true);
    }
    else
    {
        if(!this.parent.worldTransform3d)this.parent.worldTransform3d = glMat.mat4.create()
    }

    this.updateTransform3d();
};

Container3d.prototype.updateTransform3d = function()
{
    this.worldProjectionMatrix = this.projectionMatrix || this.parent.worldProjectionMatrix;
    this.displayObjectUpdateTransform3d();

    var i,j;

    for (i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform3d();
    }
};

Container3d.prototype.renderWebGL = function(renderer)
{
    this.renderWebGL3d( renderer );
}

module.exports = Container3d;

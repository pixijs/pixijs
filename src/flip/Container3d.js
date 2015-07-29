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
    core.Container.call(this);

    // pixin some new 3d magic!
    this.position = new math3d.Point3d(0, 0, 0);
    this.scale = new math3d.Point3d(1, 1, 1);
    this.rotation = new math3d.Point3d(0, 0, 0);

    this.worldTransform3d = glMat.mat4.create();

    this.is3d = true;
    this.projectionMatrix = null//glMat.mat4.create();


}


// constructor
Container3d.prototype = Object.create(core.Container.prototype);
Container3d.prototype.constructor = Container3d;


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

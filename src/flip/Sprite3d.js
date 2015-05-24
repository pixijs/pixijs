var core = require('../core'),
    glMat = require('gl-matrix'),
    math3d = require('./math'),
    tempPoint = new core.Point();
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
function Sprite3d(texture)
{
    core.Sprite.call(this, texture);

    // pixin some new 3d magic!
    this.position = new math3d.Point3d(0, 0, 0);
    this.scale = new math3d.Point3d(1, 1, 1);
    this.rotation = new math3d.Point3d(0, 0, 0);

    this.worldTransform3d = glMat.mat4.create();

    this.is3d = true;
}


// constructor
Sprite3d.prototype = Object.create(core.Sprite.prototype);
Sprite3d.prototype.constructor = Sprite3d;

Sprite3d.prototype.updateTransform = function()
{
    if(this.parent.convertFrom2dTo3d)
    {
        this.parent.convertFrom2dTo3d(true)//this.parent);
    }
    else
    {
        if(!this.parent.worldTransform3d)this.parent.worldTransform3d = glMat.mat4.create()
    }

    this.updateTransform3d();
};

Sprite3d.prototype.updateTransform3d = function()
{
    this.displayObjectUpdateTransform3d();
    var i,j;

    for (i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform3d();
    }
};

Sprite3d.prototype.renderWebGL = function(renderer)
{
    this.renderWebGL3d( renderer );
};



/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {String} The frame Id of the texture in the cache
 * @return {Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite3d.fromFrame = function (frameId)
{
    var texture = core.utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache' + this);
    }

    return new Sprite3d(texture);
};

/**
 * Helper function that creates a Sprite3d that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {String} The image url of the texture
 * @return {Sprite3d} A new Sprite3d using a texture from the texture cache matching the image id
 */
Sprite3d.fromImage = function (imageId, crossorigin, scaleMode)
{
    return new Sprite3d(core.Texture.fromImage(imageId, crossorigin, scaleMode));
};


module.exports = Sprite3d;

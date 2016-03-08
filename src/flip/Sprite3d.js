var core = require('../core'),
    glMat = require('gl-matrix'),
    math3d = require('./math'),
    tempPoint = new core.Point(),
    tempPoint3d = glMat.vec3.create(),
    minPoint3d = glMat.vec3.create(),
    maxPoint3d = glMat.vec3.create(),
    tempTransform = glMat.mat4.create();
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
    this.projectionMatrix = null//glMat.mat4.create();
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

Sprite3d.prototype.getBounds = function (matrix)
{
    if(!this._currentBounds)
    {

        var width = this._texture._frame.width;
        var height = this._texture._frame.height;

        var w0 = width * (1-this.anchor.x);
        var w1 = width * -this.anchor.x;

        var h0 = height * (1-this.anchor.y);
        var h1 = height * -this.anchor.y;

        var worldTransform = matrix || this.worldTransform3d;
        if (this.projectionMatrix) {
            glMat.mat4.multiply(tempTransform, this.projectionMatrix, worldTransform);
        } else {
            glMat.mat4.copy(tempTransform, worldTransform);
        }

        //TODO: test Z value, may be it cant be rendered in this camera
        tempPoint3d[0] = w0;
        tempPoint3d[1] = h0;
        tempPoint3d[2] = 0;
        glMat.vec3.transformMat4(tempPoint3d, tempPoint3d, tempTransform);
        glMat.vec3.copy(minPoint3d, tempPoint3d);
        glMat.vec3.copy(maxPoint3d, tempPoint3d);
        tempPoint3d[0] = w0;
        tempPoint3d[1] = h1;
        tempPoint3d[2] = 0;
        glMat.vec3.transformMat4(tempPoint3d, tempPoint3d, tempTransform);
        glMat.vec3.min(minPoint3d, minPoint3d, tempPoint3d);
        glMat.vec3.max(maxPoint3d, maxPoint3d, tempPoint3d);
        tempPoint3d[0] = w1;
        tempPoint3d[1] = h1;
        tempPoint3d[2] = 0;
        glMat.vec3.transformMat4(tempPoint3d, tempPoint3d, tempTransform);
        glMat.vec3.min(minPoint3d, minPoint3d, tempPoint3d);
        glMat.vec3.max(maxPoint3d, maxPoint3d, tempPoint3d);
        tempPoint3d[0] = w1;
        tempPoint3d[1] = h0;
        tempPoint3d[2] = 0;
        glMat.vec3.transformMat4(tempPoint3d, tempPoint3d, tempTransform);
        glMat.vec3.min(minPoint3d, minPoint3d, tempPoint3d);
        glMat.vec3.max(maxPoint3d, maxPoint3d, tempPoint3d);

        var minX = minPoint3d[0], maxX = maxPoint3d[0], minY = minPoint3d[1], maxY = maxPoint3d[1];

        //if (this.projectionMatrix) {
        //    var halfWidth = 1.0 / this.projectionMatrix[0];
        //    var halfHeight = -1.0 / this.projectionMatrix[5];
        //    minX = (minPoint3d[0] + 1) * halfWidth;
        //    maxX = (maxPoint3d[0] + 1) * halfWidth;
        //    maxY = (-minPoint3d[1] + 1) * halfHeight;
        //    minY = (-maxPoint3d[1] + 1) * halfHeight;
        //}

        if(this.children.length)
        {
            var childBounds = this.containerGetBounds();

            w0 = childBounds.x;
            w1 = childBounds.x + childBounds.width;
            h0 = childBounds.y;
            h1 = childBounds.y + childBounds.height;

            minX = (minX < w0) ? minX : w0;
            minY = (minY < h0) ? minY : h0;

            maxX = (maxX > w1) ? maxX : w1;
            maxY = (maxY > h1) ? maxY : h1;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;
    }

    return this._currentBounds;
};

module.exports = Sprite3d;

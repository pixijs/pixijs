var core = require('../core'),
    Container3d = require('./Container3d'),
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
function Sprite3d(texture)
{
    this.euler = new math3d.Euler(0, 0, 0);
    core.Sprite.call(this, texture);

    // pixin some new 3d magic!
    this.position = new math3d.Point3d(0, 0, 0);
    this.scale = new math3d.Point3d(1, 1, 1);

    this.worldTransform3d = glMat.mat4.create();

    this.is3d = true;
    this.isCulled3d = false;
    this._bounds2 = new core.Rectangle();

    this.projectionMatrix = null;
    this.worldProjectionMatrix = null;

    this._currentSphereBounds = null;
    this._sphereBounds = new math3d.Sphere();
}

Object.defineProperties(Sprite3d.prototype, {
    /**
     * @member {number}
     * @memberof PIXI.flip.Sprite3d#
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
Sprite3d.prototype = Object.create(core.Sprite.prototype);
Sprite3d.prototype.constructor = Sprite3d;

Sprite3d.prototype.updateTransform = Container3d.prototype.updateTransform3d;

Sprite3d.prototype.updateTransform3d = Container3d.prototype.updateTransform3d;

Sprite3d.prototype.renderWebGL = Container3d.prototype.renderWebGL;

Sprite3d.prototype.containerGetSphereBounds = Container3d.prototype.containerGetSphereBounds;


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

Sprite3d.prototype.containsPlanePoint = function(point) {
    var width = this._texture._frame.width;
    var height = this._texture._frame.height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;
    return point.x >= w0 && point.x <= w1 &&
        point.y >= h0 && point.y <= h1;
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

        var b = math3d.makeRectBounds(this._bounds2, worldTransform, this.worldProjectionMatrix, w0, h0, w1, h1);
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

var vec3 = glMat.vec3;
var tempVec3 = vec3.create();

Sprite3d.prototype.getSphereBounds = function(matrix) {
    if(!this._currentSphereBounds)
    {
        var width = this._texture._frame.width;
        var height = this._texture._frame.height;

        var w0 = width * (1-this.anchor.x);
        var w1 = width * -this.anchor.x;

        var h0 = height * (1-this.anchor.y);
        var h1 = height * -this.anchor.y;

        var worldTransform = matrix || this.worldTransform3d;
        var b = this._sphereBounds;
        b.v[0] = w0;
        b.v[1] = h0;
        b.v[2] = 0;
        vec3.transformMat4(tempVec3, b.v, worldTransform);
        b.v[0] = w1;
        b.v[1] = h1;
        b.v[2] = 0;
        vec3.transformMat4(b.v, b.v, worldTransform);
        b.r = vec3.distance(b.v, tempVec3)/2;
        b.v[0] = w1;
        b.v[1] = h0;
        b.v[2] = 0;
        vec3.transformMat4(tempVec3, b.v, worldTransform);
        b.v[0] = w1;
        b.v[1] = h0;
        b.v[2] = 0;
        vec3.transformMat4(b.v, b.v, worldTransform);
        b.r = Math.max(b.r, vec3.distance(b.v, tempVec3)/2);

        vec3.lerp(b.v, tempVec3, b.v, 0.5);

        if (b === core.Rectangle.EMPTY) {
            return this._currentBounds = b;
        }

        if(this.children.length)
        {
            b.enlarge(this.containerGetSphereBounds());
        }
        this._currentSphereBounds = b;
    }

    return this._currentSphereBounds;
};

module.exports = Sprite3d;

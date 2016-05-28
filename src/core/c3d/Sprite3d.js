var Sprite = require('../sprites/Sprite'),
    Transform3d = require('./Transform3d'),
    ComputedTransform3d = require('./ComputedTransform3d'),
    Texture = require('../textures/Texture'),
    utils = require('../utils');

/**
 * Sprite with built-in 3d transform
 * @constructor
 * @extends PIXI.Container
 */
function Sprite3d(texture, sharedFrame) {
    Sprite.call(this, texture, sharedFrame);
}

Sprite3d.prototype = Object.create(Sprite.prototype);
Sprite3d.prototype.constructor = Sprite3d;

module.exports = Sprite3d;

Sprite3d.prototype.initTransform = function() {
    this.transform = new Transform3d(true);
    this.computedTransform = new ComputedTransform3d();
};

Object.defineProperties(Sprite3d.prototype, {
    /**
     * The position of the displayObject on the z axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    z: {
        get: function ()
        {
            return this.transform.position.z;
        },
        set: function (value)
        {
            this.transform.position.z = value;
        }
    },

    skew: {
        get: function() {
            return null;
        },
        set: function() {
            //nothing
        }
    },

    /**
     * The rotation of the object as euler angles
     *
     * @member {number}
     */
    euler: {
        get: function ()
        {
            return this.transform.euler;
        },
        set: function (value)
        {
            this.transform.euler.copy(value);
        }
    }
});

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite3d.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return new Sprite3d(texture);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
Sprite3d.fromImage = function (imageId, crossorigin, scaleMode)
{
    return new Sprite3d(Texture.fromImage(imageId, crossorigin, scaleMode));
};

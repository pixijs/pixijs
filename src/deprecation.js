/*global console */
var core   = require('./core'),
    mesh   = require('./mesh'),
    text   = require('./text');

/**
 * @class
 * @name PIXI.SpriteBatch
 * @see {@link PIXI.ParticleContainer}
 * @throws {ReferenceError} SpriteBatch does not exist any more, please use the new ParticleContainer instead.
 */
core.SpriteBatch = function ()
{
    throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};

/**
 * @class
 * @name PIXI.AssetLoader
 * @see {@link PIXI.Loader}
 * @throws {ReferenceError} The loader system was overhauled in pixi v3, please see the new PIXI.Loader class.
 */
core.AssetLoader = function () {
    throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.Loader class.');
};

Object.defineProperties(core, {

    /**
     * @class
     * @name PIXI.Stage
     * @see {@link PIXI.Container}
     * @deprecated since version 3.0
     */
    Stage: {
        get: function ()
        {
            console.warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
            return core.Container;
        }
    },

    /**
     * @class
     * @name PIXI.DisplayObjectContainer
     * @see {@link PIXI.Container}
     * @deprecated since version 3.0
     */
    DisplayObjectContainer: {
        get: function ()
        {
            console.warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
            return core.Container;
        }
    },

    /**
     * @class
     * @name PIXI.Strip
     * @see {@link PIXI.Mesh}
     * @deprecated since version 3.0
     */
    Strip: {
        get: function ()
        {
            console.warn('The Strip class has been renamed to Mesh, please use Mesh from now on.');
            return mesh.Mesh;
        }
    }

});

/**
 * @method
 * @name PIXI.Sprite#setTexture
 * @see {@link PIXI.Sprite#texture}
 * @deprecated since version 3.0
 */
core.Sprite.prototype.setTexture = function (texture)
{
    this.texture = texture;
    console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};

/**
 * @method
 * @name PIXI.BitmapText#setText
 * @see {@link PIXI.BitmapText#text}
 * @deprecated since version 3.0
 */
text.BitmapText.prototype.setText = function (text)
{
    this.text = text;
    console.warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setText
 * @see {@link PIXI.Text#text}
 * @deprecated since version 3.0
 */
text.Text.prototype.setText = function (text)
{
    this.text = text;
    console.warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

module.exports = {};

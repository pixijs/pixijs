var core = require('./core'),
    math = core.math,
    // plugins:
    extras         = require('./extras'),
    filters        = require('./filters'),
    interaction    = require('./interaction'),
    loaders        = require('./loaders'),
    spine          = require('./spine'),
    text           = require('./text');

core.Stage = function ()
{
        window.console.warn("You don't need to use a PIXI Stage any more, you can simply render any container");
        return new core.Container();
};

core.SpriteBatch = function ()
{
        window.console.warn("SpriteBatch doesn't exist any more, please use the new ParticleContainer instead");
};

core.Sprite.prototype.setTexture = function ()
{
    window.console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture; ');
};

text.BitmapText.prototype.setText = function ()
{
    window.console.warn(" setText is now deprecated, please use the text property, e.g : myBitmapText.text = 'my text'; ");
};

text.Text.prototype.setText = function ()
{
    window.console.warn(" setText is now deprecated, please use the text property, e.g : myText.text = 'my text'; ");
};

module.exports = {};

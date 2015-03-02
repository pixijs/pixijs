var core = require('./core'),
    text = require('./text');

core.Stage = function ()
{
    window.console.warn("You don't need to use a PIXI Stage any more, you can simply render any container.");
    return new core.Container();
};

core.SpriteBatch = function ()
{
    window.console.warn("SpriteBatch doesn't exist any more, please use the new ParticleContainer instead.");
};

core.AssetsLoader = function () {
    window.console.warn("The loader system was overhauled in pixi v3, please see the new PIXI.Loader class.");
};

core.Sprite.prototype.setTexture = function (texture)
{
    this.texture = texture;
    window.console.warn("setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;");
};

text.BitmapText.prototype.setText = function (text)
{
    this.text = text;
    window.console.warn("setText is now deprecated, please use the text property, e.g : myBitmapText.text = 'my text';");
};

text.Text.prototype.setText = function (text)
{
    this.text = text;
    window.console.warn("setText is now deprecated, please use the text property, e.g : myText.text = 'my text';");
};

module.exports = {};

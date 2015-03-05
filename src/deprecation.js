var core   = require('./core'),
    extras = require('./extras'),
    text   = require('./text');

core.Stage = function ()
{
    window.console.warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
    return new core.Container();
};

core.SpriteBatch = function ()
{
    window.console.warn('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};

core.AssetsLoader = function () {
    window.console.warn('The loader system was overhauled in pixi v3, please see the new PIXI.Loader class.');
};

core.DisplayObjectContainer = function () {
    window.console.warn('DisplayObjectContainer has been shortened to Container, please use Container from now on');
    return new core.Container();
};

core.Strip = function (texture) {
    window.console.warn('The Strip class has been renamed to Mesh, please use Mesh from now on');
    return new extras.mesh.Mesh(texture);
};

core.Sprite.prototype.setTexture = function (texture)
{
    this.texture = texture;
    window.console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};

text.BitmapText.prototype.setText = function (text)
{
    this.text = text;
    window.console.warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

text.Text.prototype.setText = function (text)
{
    this.text = text;
    window.console.warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

module.exports = {};

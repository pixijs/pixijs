var core = module.exports = require('./core');

// plugins:
core.extras         = require('./extras');
core.filters        = require('./filters');
core.interaction    = require('./interaction');
core.loaders        = require('./loaders');
//core.spine          = require('./spine');
core.text           = require('./text');


//MONKEY PATCHING!
core.Text = core.text.Text;
core.Point = core.math.Point;
core.Rectangle = core.math.Rectangle;
core.Matrix = core.math.Matrix;

core.blendModes = core.CONST.BLEND_MODES;


var id =0;


core.Circle = core.math.Circle;

core.flip = require('./flip');

core.loaders.Loader.prototype.addList = function(list)
{
    for (var i = 0; i < list.length; i++) {
        this.add((id++)+"_", list[i])
    };

}

core.Sprite.prototype.setTexture = function(tex)
{
    this.texture = tex
}


core.Text.prototype.setText = function(text)
{
    this.text = text
}

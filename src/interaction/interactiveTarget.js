var core = require('../core'),
	extras = require('../extras');


core.DisplayObject.prototype.interactive = false;
core.DisplayObject.prototype.buttonMode = false;
core.DisplayObject.prototype.interactiveChildren = true;
core.DisplayObject.prototype.defaultCursor = 'pointer';

// some internal checks..
core.DisplayObject.prototype._over = false;
core.DisplayObject.prototype._touchDown = false;


core.Sprite.prototype.hitTest = core.Sprite.prototype.containsPoint;


core.Graphics.prototype.hitTest = core.Graphics.prototype.containsPoint;

extras.TilingSprite.prototype.hitTest = extras.TilingSprite.prototype.containsPoint;

module.exports = {};

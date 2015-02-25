var core = require('../core');


core.DisplayObject.prototype.interactive = false;
core.DisplayObject.prototype.dblClickDelay = 700;
core.DisplayObject.prototype.buttonMode = false;
core.DisplayObject.prototype.interactiveChildren = true;
core.DisplayObject.prototype.defaultCursor = 'pointer';

// some internal checks..
core.DisplayObject.prototype._over = false;
core.DisplayObject.prototype._touchDown = false;


core.Sprite.prototype.hitTest = core.Sprite.prototype.containsPoint;


core.Graphics.prototype.hitTest = core.Graphics.prototype.containsPoint;

module.exports = {};

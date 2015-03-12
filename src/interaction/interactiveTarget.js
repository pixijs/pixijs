var core = require('../core');


core.DisplayObject.prototype.interactive = false;
core.DisplayObject.prototype.buttonMode = false;
core.DisplayObject.prototype.interactiveChildren = true;
core.DisplayObject.prototype.defaultCursor = 'pointer';

// some internal checks..
core.DisplayObject.prototype._over = false;
core.DisplayObject.prototype._touchDown = false;

module.exports = {};

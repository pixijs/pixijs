import { Sprite } from '@pixi/sprite';

/**
* Renders the object using the Canvas renderer
*
* @private
* @method _renderCanvas
* @memberof PIXI.Sprite#
* @param {PIXI.CanvasRenderer} renderer - The renderer
*/
Sprite.prototype._renderCanvas = function _renderCanvas(renderer)
{
    renderer.plugins[this.pluginName].render(this);
};

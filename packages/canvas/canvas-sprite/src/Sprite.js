import { Sprite } from '@pixi/sprite';

/**
 * Cached tinted texture.
 * @memberof PIXI.Sprite#
 * @member {HTMLCanvasElement} _tintedCanvas
 * @protected
 */
Sprite.prototype._tintedCanvas = null;

/**
 * Cached tint value so we can tell when the tint is changed.
 * @memberof PIXI.Sprite#
 * @member {number} _cachedTint
 * @protected
 */
Sprite.prototype._cachedTint = 0xFFFFFF;

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
    renderer.plugins.sprite.render(this);
};

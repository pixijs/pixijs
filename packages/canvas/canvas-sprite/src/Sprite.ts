import { Sprite } from '@pixi/sprite';
import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Cached tinted texture.
 * @memberof PIXI.Sprite#
 * @member {HTMLCanvasElement} _tintedCanvas
 * @protected
 */
Sprite.prototype._tintedCanvas = null;

/**
* Renders the object using the Canvas renderer
*
* @private
* @method _renderCanvas
* @memberof PIXI.Sprite#
* @param {PIXI.CanvasRenderer} renderer - The renderer
*/
Sprite.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    renderer.plugins.sprite.render(this);
};

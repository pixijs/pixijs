import { Text } from '@pixi/text';
import { Sprite } from '@pixi/sprite';

/**
 * Renders the object using the Canvas renderer
 *
 * @method _renderCanvas
 * @memberof PIXI.Text#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Text.prototype._renderCanvas = function _renderCanvas(renderer)
{
    if (this._autoResolution && this._resolution !== renderer.resolution)
    {
        this._resolution = renderer.resolution;
        this.dirty = true;
    }

    this.updateText(true);

    Sprite.prototype._renderCanvas.call(this, renderer);
};

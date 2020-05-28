import { Text } from '@pixi/text';
import { Sprite } from '@pixi/sprite';

import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Renders the object using the Canvas renderer
 *
 * @method _renderCanvas
 * @memberof PIXI.Text#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Text.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    if (this._autoResolution && this._resolution !== renderer.resolution)
    {
        this._resolution = renderer.resolution;
        this.dirty = true;
    }

    this.updateText(true);

    // TODO: remove when canvas-sprite is merged
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    Sprite.prototype._renderCanvas.call(this, renderer);
};

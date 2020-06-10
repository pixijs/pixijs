import { SimpleRope } from '@pixi/mesh-extras';

import type { RopeGeometry } from '@pixi/mesh-extras';
import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Renders the object using the Canvas renderer
 *
 * @protected
 * @method _renderCanvas
 * @memberof PIXI.Mesh#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 */
SimpleRope.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    if (this.autoUpdate
        || (this.geometry as RopeGeometry)._width !== this.shader.texture.height)
    {
        (this.geometry as RopeGeometry)._width = this.shader.texture.height;
        (this.geometry as RopeGeometry).update();
    }

    if (this.shader.update)
    {
        this.shader.update();
    }

    this.calculateUvs();

    this.material._renderCanvas(renderer, this);
};

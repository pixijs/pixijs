import { SimpleMesh } from '@pixi/mesh-extras';

import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Renders the object using the Canvas renderer
 *
 * @private
 * @method _renderCanvas
 * @memberof PIXI.Mesh#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 */
SimpleMesh.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    if (this.autoUpdate)
    {
        this.geometry.getBuffer('aVertexPosition').update();
    }

    if (this.shader.update)
    {
        this.shader.update();
    }

    this.calculateUvs();

    this.material._renderCanvas(renderer, this);
};

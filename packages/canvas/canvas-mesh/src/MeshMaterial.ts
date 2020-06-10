import { MeshMaterial } from '@pixi/mesh';

import type { Mesh } from '@pixi/mesh';
import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Renders the mesh using the Canvas renderer
 *
 * @protected
 * @method render
 * @memberof PIXI.MeshMaterial#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 * @param {PIXI.Mesh} mesh - Mesh to render.
 */
MeshMaterial.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer, mesh: Mesh): void
{
    renderer.plugins.mesh.render(mesh);
};

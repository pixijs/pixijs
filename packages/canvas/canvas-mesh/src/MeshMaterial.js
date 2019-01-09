import { MeshMaterial } from '@pixi/mesh';

/**
 * Renders the mesh using the Canvas renderer
 *
 * @protected
 * @method render
 * @memberof PIXI.MeshMaterial#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 * @param {PIXI.Mesh} mesh - Mesh to render.
 */
MeshMaterial.prototype._renderCanvas = function _renderCanvas(renderer, mesh)
{
    renderer.plugins.mesh.render(mesh);
};

import { Mesh } from '@pixi/mesh';

/**
 * Renders the object using the Canvas renderer
 *
 * @private
 * @method _renderCanvas
 * @memberof PIXI.Mesh#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 */
Mesh.prototype._renderCanvas = function _renderCanvas(renderer)
{
    renderer.plugins[this.pluginName].render(this);
};

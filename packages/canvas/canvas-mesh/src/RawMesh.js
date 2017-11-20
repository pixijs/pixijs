import { RawMesh } from '@pixi/mesh';

/**
 * Renders the object using the Canvas renderer
 *
 * @private
 * @method _renderCanvas
 * @memberof PIXI.RawMesh#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 */
RawMesh.prototype._renderCanvas = function _renderCanvas(renderer)
{
    renderer.plugins[this.pluginName].render(this);
};

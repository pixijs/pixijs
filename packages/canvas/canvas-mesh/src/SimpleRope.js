import { SimpleRope } from '@pixi/mesh-extras';

/**
 * Renders the object using the Canvas renderer
 *
 * @protected
 * @method _renderCanvas
 * @memberof PIXI.Mesh#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 */
SimpleRope.prototype._renderCanvas = function _renderCanvas(renderer)
{
    if (this.autoUpdate
        || this.geometry._width !== this.shader.texture.height)
    {
        this.geometry._width = this.shader.texture.height;
        this.geometry.update();
    }

    if (this.shader.update)
    {
        this.shader.update();
    }

    this.calculateUvs();

    this.material._renderCanvas(renderer, this);
};

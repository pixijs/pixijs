import { NineSlicePlane } from '@pixi/mesh';

/**
 * Renders the object using the Canvas renderer
 *
 * @private
 * @method _renderCanvas
 * @memberof PIXI.NineSlicePlane#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer to render with.
 */
NineSlicePlane.prototype._renderCanvas = function _renderCanvas(renderer)
{
    const context = renderer.context;

    context.globalAlpha = this.worldAlpha;
    renderer.setBlendMode(this.blendMode);

    const transform = this.worldTransform;
    const res = renderer.resolution;

    if (renderer.roundPixels)
    {
        context.setTransform(
            transform.a * res,
            transform.b * res,
            transform.c * res,
            transform.d * res,
            (transform.tx * res) | 0,
            (transform.ty * res) | 0
        );
    }
    else
    {
        context.setTransform(
            transform.a * res,
            transform.b * res,
            transform.c * res,
            transform.d * res,
            transform.tx * res,
            transform.ty * res
        );
    }

    const base = this._texture.baseTexture;
    const textureSource = base.source;
    const w = base.width * base.resolution;
    const h = base.height * base.resolution;

    this.drawSegment(context, textureSource, w, h, 0, 1, 10, 11);
    this.drawSegment(context, textureSource, w, h, 2, 3, 12, 13);
    this.drawSegment(context, textureSource, w, h, 4, 5, 14, 15);
    this.drawSegment(context, textureSource, w, h, 8, 9, 18, 19);
    this.drawSegment(context, textureSource, w, h, 10, 11, 20, 21);
    this.drawSegment(context, textureSource, w, h, 12, 13, 22, 23);
    this.drawSegment(context, textureSource, w, h, 16, 17, 26, 27);
    this.drawSegment(context, textureSource, w, h, 18, 19, 28, 29);
    this.drawSegment(context, textureSource, w, h, 20, 21, 30, 31);
};

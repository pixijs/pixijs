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
    const textureSource = base.getDrawableSource();
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

/**
 * Renders one segment of the plane.
 * to mimic the exact drawing behavior of stretching the image like WebGL does, we need to make sure
 * that the source area is at least 1 pixel in size, otherwise nothing gets drawn when a slice size of 0 is used.
 *
 * @method drawSegment
 * @memberof PIXI.NineSlicePlane#
 * @param {CanvasRenderingContext2D} context - The context to draw with.
 * @param {CanvasImageSource} textureSource - The source to draw.
 * @param {number} w - width of the texture
 * @param {number} h - height of the texture
 * @param {number} x1 - x index 1
 * @param {number} y1 - y index 1
 * @param {number} x2 - x index 2
 * @param {number} y2 - y index 2
 */
NineSlicePlane.prototype.drawSegment = function drawSegment(context, textureSource, w, h, x1, y1, x2, y2)
{
    // otherwise you get weird results when using slices of that are 0 wide or high.
    const uvs = this.uvs;
    const vertices = this.vertices;

    let sw = (uvs[x2] - uvs[x1]) * w;
    let sh = (uvs[y2] - uvs[y1]) * h;
    let dw = vertices[x2] - vertices[x1];
    let dh = vertices[y2] - vertices[y1];

    // make sure the source is at least 1 pixel wide and high, otherwise nothing will be drawn.
    if (sw < 1)
    {
        sw = 1;
    }

    if (sh < 1)
    {
        sh = 1;
    }

    // make sure destination is at least 1 pixel wide and high, otherwise you get
    // lines when rendering close to original size.
    if (dw < 1)
    {
        dw = 1;
    }

    if (dh < 1)
    {
        dh = 1;
    }

    context.drawImage(textureSource, uvs[x1] * w, uvs[y1] * h, sw, sh, vertices[x1], vertices[y1], dw, dh);
};

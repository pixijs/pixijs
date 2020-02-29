import { canvasUtils } from '@pixi/canvas-renderer';
import { NineSlicePlane } from '@pixi/mesh-extras';

/**
 * Cached tint value so we can tell when the tint is changed.
 * @memberof PIXI.NineSlicePlane#
 * @member {number} _cachedTint
 * @protected
 */
NineSlicePlane.prototype._cachedTint = 0xFFFFFF;

/**
 * Cached tinted texture.
 * @memberof PIXI.NineSlicePlane#
 * @member {HTMLCanvasElement} _tintedCanvas
 * @protected
 */
NineSlicePlane.prototype._tintedCanvas = null;

/**
 * Temporary storage for canvas source coords
 * @memberof PIXI.NineSlicePlane#
 * @member {number[]} _canvasUvs
 * @private
 */
NineSlicePlane.prototype._canvasUvs = null;

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
    const transform = this.worldTransform;
    const isTinted = this.tint !== 0xFFFFFF;
    const texture = this.texture;

    if (!texture.valid)
    {
        return;
    }

    // Work out tinting
    if (isTinted)
    {
        if (this._cachedTint !== this.tint)
        {
            // Tint has changed, need to update the tinted texture and use that instead

            this._cachedTint = this.tint;

            this._tintedCanvas = canvasUtils.getTintedCanvas(this, this.tint);
        }
    }

    const textureSource = !isTinted ? texture.baseTexture.getDrawableSource() : this._tintedCanvas;

    if (!this._canvasUvs)
    {
        this._canvasUvs = [0, 0, 0, 0, 0, 0, 0, 0];
    }

    const vertices = this.vertices;
    const uvs = this._canvasUvs;
    const u0 = isTinted ? 0 : texture.frame.x;
    const v0 = isTinted ? 0 : texture.frame.y;
    const u1 = u0 + texture.frame.width;
    const v1 = v0 + texture.frame.height;

    uvs[0] = u0;
    uvs[1] = u0 + this._leftWidth;
    uvs[2] = u1 - this._rightWidth;
    uvs[3] = u1;
    uvs[4] = v0;
    uvs[5] = v0 + this._topHeight;
    uvs[6] = v1 - this._bottomHeight;
    uvs[7] = v1;

    for (let i = 0; i < 8; i++)
    {
        uvs[i] *= texture.baseTexture.resolution;
    }

    context.globalAlpha = this.worldAlpha;
    renderer.setBlendMode(this.blendMode);
    renderer.setContextTransform(transform, this.roundPixels);

    for (let row = 0; row < 3; row++)
    {
        for (let col = 0; col < 3; col++)
        {
            const ind = (col * 2) + (row * 8);
            const sw = Math.max(1, uvs[col + 1] - uvs[col]);
            const sh = Math.max(1, uvs[row + 5] - uvs[row + 4]);
            const dw = Math.max(1, vertices[ind + 10] - vertices[ind]);
            const dh = Math.max(1, vertices[ind + 11] - vertices[ind + 1]);

            context.drawImage(textureSource, uvs[col], uvs[row + 4], sw, sh,
                vertices[ind], vertices[ind + 1], dw, dh);
        }
    }
};

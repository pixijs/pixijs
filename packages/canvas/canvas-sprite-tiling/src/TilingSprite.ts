import { TilingSprite } from '@pixi/sprite-tiling';
import { canvasUtils } from '@pixi/canvas-renderer';
import { CanvasRenderTarget } from '@pixi/utils';
import { Matrix, Point } from '@pixi/math';

import type { CanvasRenderer } from '@pixi/canvas-renderer';

const tempMatrix = new Matrix();
const tempPoints = [new Point(), new Point(), new Point(), new Point()];

/**
 * Renders the object using the Canvas renderer
 *
 * @protected
 * @function _renderCanvas
 * @memberof PIXI.TilingSprite#
 * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
 */
TilingSprite.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    const texture = this._texture;

    if (!texture.baseTexture.valid)
    {
        return;
    }

    const context = renderer.context;
    const transform = this.worldTransform;
    const baseTexture = texture.baseTexture;
    const source = baseTexture.getDrawableSource();
    const baseTextureResolution = baseTexture.resolution;

    // create a nice shiny pattern!
    if (this._textureID !== this._texture._updateID || this._cachedTint !== this.tint)
    {
        this._textureID = this._texture._updateID;
        // cut an object from a spritesheet..
        const tempCanvas = new CanvasRenderTarget(texture._frame.width,
            texture._frame.height,
            baseTextureResolution);

        // Tint the tiling sprite
        if (this.tint !== 0xFFFFFF)
        {
            this._tintedCanvas = canvasUtils.getTintedCanvas(this, this.tint) as HTMLCanvasElement;
            tempCanvas.context.drawImage(this._tintedCanvas, 0, 0);
        }
        else
        {
            tempCanvas.context.drawImage(source,
                -texture._frame.x * baseTextureResolution, -texture._frame.y * baseTextureResolution);
        }
        this._cachedTint = this.tint;
        this._canvasPattern = tempCanvas.context.createPattern(tempCanvas.canvas, 'repeat');
    }

    // set context state..
    context.globalAlpha = this.worldAlpha;
    renderer.setBlendMode(this.blendMode);

    this.tileTransform.updateLocalTransform();
    const lt = this.tileTransform.localTransform;
    const W = this._width;
    const H = this._height;

    tempMatrix.identity();
    tempMatrix.copyFrom(lt);
    tempMatrix.prepend(transform);

    renderer.setContextTransform(tempMatrix);

    // fill the pattern!
    context.fillStyle = this._canvasPattern;

    const anchorX = this.uvRespectAnchor ? this.anchor.x * -W : 0;
    const anchorY = this.uvRespectAnchor ? this.anchor.y * -H : 0;

    tempPoints[0].set(anchorX, anchorY);
    tempPoints[1].set(anchorX + W, anchorY);
    tempPoints[2].set(anchorX + W, anchorY + H);
    tempPoints[3].set(anchorX, anchorY + H);
    for (let i = 0; i < 4; i++)
    {
        lt.applyInverse(tempPoints[i], tempPoints[i]);
    }

    context.beginPath();
    context.moveTo(tempPoints[0].x, tempPoints[0].y);
    for (let i = 1; i < 4; i++)
    {
        context.lineTo(tempPoints[i].x, tempPoints[i].y);
    }
    context.closePath();
    context.fill();
};

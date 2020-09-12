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
    const modX = ((this.tilePosition.x / this.tileScale.x) % texture._frame.width) * baseTextureResolution;
    const modY = ((this.tilePosition.y / this.tileScale.y) % texture._frame.height) * baseTextureResolution;

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
    const w = texture.width;
    const h = texture.height;
    const W = this._width;
    const H = this._height;

    tempMatrix.identity();
    tempMatrix.set(
        lt.a * w / W,
        lt.b * w / H,
        lt.c * h / W,
        lt.d * h / H,
        lt.tx / W,
        lt.ty / H
    );
    tempMatrix.prepend(transform);

    renderer.setContextTransform(tempMatrix);

    // fill the pattern!
    context.fillStyle = this._canvasPattern;

    const anchorX = this.anchor.x * -this._width;
    const anchorY = this.anchor.y * -this._height;

    if (this.uvRespectAnchor)
    {
        tempPoints[0].set(-modX + anchorX, -modY + anchorY);
        tempPoints[1].set(this._width, -modY + anchorY);
        tempPoints[2].set(this._width, this._height);
        tempPoints[3].set(-modX + anchorX, this._height);
        tempPoints.forEach((pt) => tempMatrix.applyInverse(pt, pt));

        context.translate(modX, modY);
        context.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.forEach((pt, i) => i && context.lineTo(pt.x, pt.y));
        context.closePath();
        context.fill();
    }
    else
    {
        tempPoints[0].set(-modX, -modY);
        tempPoints[1].set(this._width, -modY);
        tempPoints[2].set(this._width, this._height);
        tempPoints[3].set(-modX, this._height);
        tempPoints.forEach((pt) => tempMatrix.applyInverse(pt, pt));

        context.translate(modX + anchorX, modY + anchorY);
        context.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.forEach((pt, i) => i && context.lineTo(pt.x, pt.y));
        context.closePath();
        context.fill();
    }
};

import { TilingSprite } from '@pixi/sprite-tiling';
import { canvasUtils } from '@pixi/canvas-renderer';
import { CanvasRenderTarget } from '@pixi/utils';

/**
 * Renders the object using the Canvas renderer
 *
 * @protected
 * @function _renderCanvas
 * @memberof PIXI.TilingSprite#
 * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
 */
TilingSprite.prototype._renderCanvas = function _renderCanvas(renderer)
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
            this._tintedCanvas = canvasUtils.getTintedCanvas(this, this.tint);
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
    renderer.setContextTransform(transform);

    // fill the pattern!
    context.fillStyle = this._canvasPattern;

    // TODO - this should be rolled into the setTransform above..
    context.scale(this.tileScale.x / baseTextureResolution, this.tileScale.y / baseTextureResolution);

    const anchorX = this.anchor.x * -this._width;
    const anchorY = this.anchor.y * -this._height;

    if (this.uvRespectAnchor)
    {
        context.translate(modX, modY);

        context.fillRect(-modX + anchorX, -modY + anchorY,
            this._width / this.tileScale.x * baseTextureResolution,
            this._height / this.tileScale.y * baseTextureResolution);
    }
    else
    {
        context.translate(modX + anchorX, modY + anchorY);

        context.fillRect(-modX, -modY,
            this._width / this.tileScale.x * baseTextureResolution,
            this._height / this.tileScale.y * baseTextureResolution);
    }
};

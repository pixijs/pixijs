import { TilingSprite } from '@pixi/sprite-tiling';
import { canvasUtils } from '@pixi/canvas-renderer';
import { CanvasRenderTarget } from '@pixi/utils';
import { Matrix, Point } from '@pixi/math';

import type { CanvasRenderer } from '@pixi/canvas-renderer';

const worldMatrix = new Matrix();
const patternMatrix = new Matrix();
const patternRect = [new Point(), new Point(), new Point(), new Point()];

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

    /*
     * # Implementation Notes
     *
     * The tiling transform is not simply a transform on the tiling sprite's local space. If that
     * were, the bounds of the tiling sprite would change. Rather the tile transform is a transform
     * on the "pattern" coordinates each vertex is assigned.
     *
     * To implement the `tileTransform`, we issue drawing commands in the pattern's own space, which
     * is defined as:
     *
     * Pattern_Space = Local_Space x inverse(tileTransform)
     *
     * In other words,
     * Local_Space = Pattern_Space x tileTransform
     *
     * We draw the pattern in pattern space, because the space we draw in defines the pattern's coordinates.
     * In other words, the pattern will always "originate" from (0, 0) in the space we draw in.
     *
     * This technique is equivalent to drawing a pattern texture, and then finding a quadrilateral that becomes
     * the tiling sprite's local bounds under the tileTransform and mapping that onto the screen.
     *
     * ## uvRespectAnchor
     *
     * The preceding paragraph discusses the case without considering `uvRespectAnchor`. The `uvRespectAnchor` flags
     * where the origin of the pattern space is. Assuming the tileTransform includes no translation, without
     * loss of generality: If uvRespectAnchor = true, then
     *
     * Local Space (0, 0) <--> Pattern Space (0, 0) (where <--> means "maps to")
     *
     * Here the mapping is provided by trivially by the tileTransform (note tileTransform includes no translation. That
     * means the invariant under all other transforms are the origins)
     *
     * Otherwise,
     *
     * Local Space (-localBounds.x, -localBounds.y) <--> Pattern Space (0, 0)
     *
     * Here the mapping is provided by the tileTransfrom PLUS some "shift". This shift is done POST-tileTransform. The shift
     * is equal to the position of the top-left corner of the tiling sprite in its local space.
     *
     * Hence,
     *
     * Local_Space = Pattern_Space x tileTransform x shiftTransform
     */

    // worldMatrix is used to convert from pattern space to world space.
    //
    // worldMatrix = tileTransform x shiftTransform x worldTransfrom
    //             = patternMatrix x worldTransform
    worldMatrix.identity();

    // patternMatrix is used to convert from pattern space to local space. The drawing commands are issued in pattern space
    // and this matrix is used to inverse-map the local space vertices into it.
    //
    // patternMatrix = tileTransfrom x shiftTransform
    patternMatrix.copyFrom(lt);

    // Apply shiftTransform into patternMatrix. See $1.1
    if (!this.uvRespectAnchor)
    {
        patternMatrix.translate(-this.anchor.x * W, -this.anchor.y * H);
    }

    worldMatrix.prepend(patternMatrix);
    worldMatrix.prepend(transform);

    renderer.setContextTransform(worldMatrix);

    // Fill the pattern!
    context.fillStyle = this._canvasPattern;

    // The position in local space we are drawing the rectangle: (lx, ly, lx + W, ly + H)
    const lx = this.anchor.x * -W;
    const ly = this.anchor.y * -H;

    // Set pattern rect in local space first.
    patternRect[0].set(lx, ly);
    patternRect[1].set(lx + W, ly);
    patternRect[2].set(lx + W, ly + H);
    patternRect[3].set(lx, ly + H);

    // Map patternRect into pattern space.
    for (let i = 0; i < 4; i++)
    {
        patternMatrix.applyInverse(patternRect[i], patternRect[i]);
    }

    /*
     * # Note about verification of theory
     *
     * As discussed in the implementation notes, you can verify that `patternRect[0]` will always be (0, 0) in case of
     * `uvRespectAnchor` false and tileTransform having no translation. Indeed, because the pattern origin should map
     * to the top-left corner of the tiling sprite in its local space.
     */

    context.beginPath();
    context.moveTo(patternRect[0].x, patternRect[0].y);

    for (let i = 1; i < 4; i++)
    {
        context.lineTo(patternRect[i].x, patternRect[i].y);
    }

    context.closePath();
    context.fill();
};

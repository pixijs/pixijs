import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { Point } from '../../../maths/point/Point';
import { canvasUtils } from '../../../rendering/renderers/canvas/utils/canvasUtils';
import { bgr2rgb } from '../../../scene/container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../../scene/container/utils/multiplyHexColors';

import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { TilingSprite } from '../TilingSprite';

// Reusable objects to avoid allocations (matching v7 approach)
const worldMatrix = new Matrix();
const patternMatrix = new Matrix();
const patternRect = [new Point(), new Point(), new Point(), new Point()];

/** @internal */
export class CanvasTilingSpritePipe implements RenderPipe<TilingSprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'tilingSprite',
    } as const;

    private _renderer: CanvasRenderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer as CanvasRenderer;
    }

    public validateRenderable(_renderable: TilingSprite): boolean
    {
        return false;
    }

    public addRenderable(tilingSprite: TilingSprite, instructionSet: InstructionSet)
    {
        this._renderer.renderPipes.batch.break(instructionSet);
        instructionSet.add(tilingSprite);
    }

    public updateRenderable(_tilingSprite: TilingSprite)
    {
        // no-op for canvas
    }

    public execute(tilingSprite: TilingSprite)
    {
        const renderer = this._renderer;
        const contextSystem = renderer.canvasContext;
        const context = contextSystem.activeContext;

        context.save();

        contextSystem.setBlendMode(tilingSprite.groupBlendMode);

        const globalColor = renderer.globalUniforms.globalUniformData?.worldColor ?? 0xFFFFFFFF;
        const groupColorAlpha = tilingSprite.groupColorAlpha;

        const globalAlpha = ((globalColor >>> 24) & 0xFF) / 255;
        const groupAlphaValue = ((groupColorAlpha >>> 24) & 0xFF) / 255;

        const filterAlpha = (renderer.filter as { alphaMultiplier?: number } | null)?.alphaMultiplier ?? 1;
        const alpha = globalAlpha * groupAlphaValue * filterAlpha;

        if (alpha <= 0)
        {
            context.restore();

            return;
        }

        context.globalAlpha = alpha;

        const globalTint = globalColor & 0xFFFFFF;
        const groupTintBGR = groupColorAlpha & 0xFFFFFF;

        const tint = bgr2rgb(multiplyHexColors(groupTintBGR, globalTint));

        const texture = tilingSprite.texture;
        const pattern = canvasUtils.getTintedPattern(texture, tint);

        const width = tilingSprite.width;
        const height = tilingSprite.height;
        const transform = tilingSprite.groupTransform;
        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;

        // Build patternMatrix from tileTransform (following v7 approach exactly)
        // patternMatrix = tileTransform x shiftTransform x scaleTransform
        patternMatrix.copyFrom(tilingSprite._tileTransform.matrix);

        // Apply anchor shift if not applying anchor to texture (v7: uvRespectAnchor)
        if (!tilingSprite.applyAnchorToTexture)
        {
            patternMatrix.translate(-tilingSprite.anchor.x * width, -tilingSprite.anchor.y * height);
        }

        // Apply resolution scaling
        patternMatrix.scale(1 / resolution, 1 / resolution);

        // Build worldMatrix = transform * patternMatrix (v7 used two prepends on identity)
        worldMatrix.identity();
        worldMatrix.prepend(patternMatrix);
        worldMatrix.prepend(transform);

        const roundPixels = (renderer._roundPixels | tilingSprite._roundPixels) as 0 | 1;

        contextSystem.setContextTransform(worldMatrix, roundPixels === 1);

        context.fillStyle = pattern;

        // Calculate rect corners in local space
        const lx = tilingSprite.anchor.x * -width;
        const ly = tilingSprite.anchor.y * -height;

        patternRect[0].set(lx, ly);
        patternRect[1].set(lx + width, ly);
        patternRect[2].set(lx + width, ly + height);
        patternRect[3].set(lx, ly + height);

        // Map rect corners from local space to pattern space
        for (let i = 0; i < 4; i++)
        {
            patternMatrix.applyInverse(patternRect[i], patternRect[i]);
        }

        // Draw path in pattern space
        context.beginPath();
        context.moveTo(patternRect[0].x, patternRect[0].y);

        for (let i = 1; i < 4; i++)
        {
            context.lineTo(patternRect[i].x, patternRect[i].y);
        }

        context.closePath();
        context.fill();

        context.restore();
    }

    public destroy()
    {
        this._renderer = null;
    }
}

import { ExtensionType } from '../../../extensions/Extensions';
import { canvasUtils } from '../../../rendering/renderers/canvas/utils/canvasUtils';
import { bgr2rgb } from '../../../scene/container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../../scene/container/utils/multiplyHexColors';

import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { TilingSprite } from '../TilingSprite';

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

        const transform = tilingSprite.groupTransform;
        const roundPixels = (renderer._roundPixels | tilingSprite._roundPixels) as 0 | 1;

        contextSystem.setContextTransform(transform, roundPixels === 1);
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

        const pattern = canvasUtils.getTintedPattern(tilingSprite.texture, tint);

        const matrix = tilingSprite._tileTransform.matrix.clone();

        if (!tilingSprite.applyAnchorToTexture)
        {
            matrix.translate(tilingSprite.anchor.x * tilingSprite.width, tilingSprite.anchor.y * tilingSprite.height);
        }

        canvasUtils.applyPatternTransform(pattern, matrix);

        context.fillStyle = pattern;

        const width = tilingSprite.width;
        const height = tilingSprite.height;
        const anchor = tilingSprite.anchor;

        context.fillRect(-anchor.x * width, -anchor.y * height, width, height);

        context.restore();
    }

    public destroy()
    {
        this._renderer = null;
    }
}

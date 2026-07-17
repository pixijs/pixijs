import { ExtensionType } from '../../../extensions/Extensions';
import { canvasUtils } from '../../../rendering/renderers/canvas/utils/canvasUtils';
import { bgr2rgb } from '../../../scene/container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../../scene/container/utils/multiplyHexColors';

import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { NineSliceSprite } from '../NineSliceSprite';

/**
 * The NineSliceSpritePipe is a render pipe for rendering NineSliceSprites with Canvas2D.
 * @internal
 */
export class CanvasNineSliceSpritePipe implements RenderPipe<NineSliceSprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'nineSliceSprite',
    } as const;

    private _renderer: CanvasRenderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer as CanvasRenderer;
    }

    public validateRenderable(_sprite: NineSliceSprite): boolean
    {
        return false;
    }

    public addRenderable(sprite: NineSliceSprite, instructionSet: InstructionSet)
    {
        this._renderer.renderPipes.batch.break(instructionSet);
        instructionSet.add(sprite);
    }

    public updateRenderable(_sprite: NineSliceSprite)
    {
        // no-op for canvas
    }

    public execute(sprite: NineSliceSprite)
    {
        const renderer = this._renderer;
        const contextSystem = renderer.canvasContext;
        const context = contextSystem.activeContext;

        context.save();

        const transform = sprite.groupTransform;
        const roundPixels = (renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        contextSystem.setContextTransform(transform, roundPixels === 1);
        contextSystem.setBlendMode(sprite.groupBlendMode);

        const globalColor = renderer.globalUniforms.globalUniformData?.worldColor ?? 0xFFFFFFFF;
        const groupColorAlpha = sprite.groupColorAlpha;

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

        const texture = sprite.texture;

        const drawSource = canvasUtils.getCanvasSource(texture);

        if (!drawSource)
        {
            context.restore();

            return;
        }

        const smoothProperty = contextSystem.smoothProperty;
        const shouldSmooth = texture.source.style.scaleMode !== 'nearest';

        if (context[smoothProperty] !== shouldSmooth)
        {
            context[smoothProperty] = shouldSmooth;
        }

        // Use getTintedCanvas when tinted OR when texture is rotated (handles rotation compensation)
        const needsProcessing = tint !== 0xFFFFFF || texture.rotate !== 0;
        const finalSource = needsProcessing
            ? canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource
            : drawSource;

        const {
            leftWidth,
            topHeight,
            rightWidth,
            bottomHeight,
            width,
            height,
        } = sprite;

        const totalBorderWidth = leftWidth + rightWidth;
        const totalBorderHeight = topHeight + bottomHeight;
        const scale = Math.min(
            totalBorderWidth > width ? width / totalBorderWidth : 1,
            totalBorderHeight > height ? height / totalBorderHeight : 1,
            1,
        );

        const destLeftWidth = leftWidth * scale;
        const destRightWidth = rightWidth * scale;
        const destTopHeight = topHeight * scale;
        const destBottomHeight = bottomHeight * scale;
        const destCenterWidth = Math.max(0, width - destLeftWidth - destRightWidth);
        const destCenterHeight = Math.max(0, height - destTopHeight - destBottomHeight);

        const anchor = sprite.anchor;

        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;
        let sx = (texture.frame.x) * resolution;
        let sy = (texture.frame.y) * resolution;

        const dx = -anchor.x * width;
        const dy = -anchor.y * height;

        const lw = leftWidth * resolution;
        const tw = topHeight * resolution;
        const rw = rightWidth * resolution;
        const bw = bottomHeight * resolution;

        let sw = (texture.frame.width) * resolution;
        let sh = (texture.frame.height) * resolution;

        if (needsProcessing)
        {
            sx = 0;
            sy = 0;
            sw = (finalSource as any).width;
            sh = (finalSource as any).height;
        }

        // Center source spans within the frame. When the borders meet or overlap along an
        // axis, the center span collapses to <= 0; a drawImage() call with a zero/negative
        // source size draws nothing, which drops the stretched center (the WebGL/WebGPU path
        // stretches the degenerate seam instead, filling it). Fall back to a 1px seam sampled
        // at the border boundary so the center column/row is still rendered.
        const centerSrcW = sw - lw - rw;
        const centerSrcH = sh - tw - bw;

        const centerSx = centerSrcW > 0 ? sx + lw : Math.min(Math.max(sx + lw, sx), sx + sw - 1);
        const centerSw = centerSrcW > 0 ? centerSrcW : 1;
        const centerSy = centerSrcH > 0 ? sy + tw : Math.min(Math.max(sy + tw, sy), sy + sh - 1);
        const centerSh = centerSrcH > 0 ? centerSrcH : 1;

        // Source and destination spans for the 3 columns and 3 rows: [start, size].
        const colsSrc = [[sx, lw], [centerSx, centerSw], [sx + sw - rw, rw]];
        const rowsSrc = [[sy, tw], [centerSy, centerSh], [sy + sh - bw, bw]];
        const colsDst = [
            [dx, destLeftWidth],
            [dx + destLeftWidth, destCenterWidth],
            [dx + width - destRightWidth, destRightWidth],
        ];
        const rowsDst = [
            [dy, destTopHeight],
            [dy + destTopHeight, destCenterHeight],
            [dy + height - destBottomHeight, destBottomHeight],
        ];

        for (let col = 0; col < 3; col++)
        {
            const [sxx, sww] = colsSrc[col];
            const [dxx, dww] = colsDst[col];

            if (dww <= 0) continue;

            for (let row = 0; row < 3; row++)
            {
                const [syy, shh] = rowsSrc[row];
                const [dyy, dhh] = rowsDst[row];

                if (dhh <= 0) continue;

                context.drawImage(finalSource, sxx, syy, sww, shh, dxx, dyy, dww, dhh);
            }
        }

        context.restore();
    }

    public destroy()
    {
        this._renderer = null;
    }
}

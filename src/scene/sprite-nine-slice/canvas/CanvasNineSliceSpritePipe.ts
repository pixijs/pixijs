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

        // Top-left
        context.drawImage(finalSource, sx, sy, lw, tw, dx, dy, destLeftWidth, destTopHeight);
        // Top-center
        context.drawImage(
            finalSource,
            sx + lw, sy,
            sw - lw - rw, tw,
            dx + destLeftWidth, dy,
            destCenterWidth, destTopHeight
        );
        // Top-right
        context.drawImage(
            finalSource,
            sx + sw - rw, sy,
            rw, tw,
            dx + width - destRightWidth, dy,
            destRightWidth, destTopHeight
        );

        // Middle-left
        context.drawImage(
            finalSource,
            sx, sy + tw,
            lw, sh - tw - bw,
            dx, dy + destTopHeight,
            destLeftWidth, destCenterHeight
        );
        // Middle-center
        context.drawImage(
            finalSource,
            sx + lw, sy + tw,
            sw - lw - rw, sh - tw - bw,
            dx + destLeftWidth, dy + destTopHeight,
            destCenterWidth, destCenterHeight
        );
        // Middle-right
        context.drawImage(
            finalSource,
            sx + sw - rw, sy + tw,
            rw, sh - tw - bw,
            dx + width - destRightWidth, dy + destTopHeight,
            destRightWidth, destCenterHeight
        );

        // Bottom-left
        context.drawImage(
            finalSource,
            sx, sy + sh - bw,
            lw, bw,
            dx, dy + height - destBottomHeight,
            destLeftWidth, destBottomHeight
        );
        // Bottom-center
        context.drawImage(
            finalSource,
            sx + lw, sy + sh - bw,
            sw - lw - rw, bw,
            dx + destLeftWidth, dy + height - destBottomHeight,
            destCenterWidth, destBottomHeight
        );
        // Bottom-right
        context.drawImage(
            finalSource,
            sx + sw - rw, sy + sh - bw,
            rw, bw,
            dx + width - destRightWidth, dy + height - destBottomHeight,
            destRightWidth, destBottomHeight
        );

        context.restore();
    }

    public destroy()
    {
        this._renderer = null;
    }
}

import { ExtensionType } from '../../extensions/Extensions';
import { canvasUtils } from '../../rendering/renderers/canvas/utils/canvasUtils';
import { RendererType } from '../../rendering/renderers/types';
import { bgr2rgb } from '../../scene/container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../scene/container/utils/multiplyHexColors';
import { GCManagedHash } from '../../utils/data/GCManagedHash';
import { BatchableMesh } from '../mesh/shared/BatchableMesh';
import { type GPUData } from '../view/ViewContainer';
import { NineSliceGeometry } from './NineSliceGeometry';

import type { CanvasRenderer } from '../../rendering/renderers/canvas/CanvasRenderer';
import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { NineSliceSprite } from './NineSliceSprite';

/**
 * GPU data for NineSliceSprite.
 * @internal
 */
export class NineSliceSpriteGpuData extends BatchableMesh implements GPUData
{
    constructor()
    {
        super();
        this.geometry = new NineSliceGeometry();
    }

    public destroy()
    {
        this.geometry.destroy();
    }
}

/**
 * The NineSliceSpritePipe is a render pipe for rendering NineSliceSprites.
 * @internal
 */
export class NineSliceSpritePipe implements RenderPipe<NineSliceSprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'nineSliceSprite',
    } as const;

    private readonly _renderer: Renderer;
    private readonly _managedSprites: GCManagedHash<NineSliceSprite>;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._managedSprites = new GCManagedHash({ renderer, type: 'renderable', name: 'nineSliceSprite' });
    }

    public addRenderable(sprite: NineSliceSprite, instructionSet: InstructionSet)
    {
        if (this._renderer.type === RendererType.CANVAS)
        {
            this._renderer.renderPipes.batch.break(instructionSet);
            instructionSet.add(sprite);

            return;
        }

        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        this._renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
    }

    public updateRenderable(sprite: NineSliceSprite)
    {
        if (this._renderer.type === RendererType.CANVAS) return;

        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        gpuSprite._batcher.updateElement(gpuSprite);
    }

    public validateRenderable(sprite: NineSliceSprite): boolean
    {
        if (this._renderer.type === RendererType.CANVAS) return false;

        const gpuSprite = this._getGpuSprite(sprite);

        return !gpuSprite._batcher.checkAndUpdateTexture(
            gpuSprite,
            sprite._texture
        );
    }

    private _updateBatchableSprite(sprite: NineSliceSprite, batchableSprite: BatchableMesh)
    {
        (batchableSprite.geometry as NineSliceGeometry)
            .update(sprite);

        // = sprite.bounds;
        batchableSprite.setTexture(sprite._texture);
    }

    private _getGpuSprite(sprite: NineSliceSprite): NineSliceSpriteGpuData
    {
        return sprite._gpuData[this._renderer.uid] || this._initGPUSprite(sprite);
    }

    private _initGPUSprite(sprite: NineSliceSprite): NineSliceSpriteGpuData
    {
        const gpuData = sprite._gpuData[this._renderer.uid] = new NineSliceSpriteGpuData();

        const batchableMesh = gpuData;

        batchableMesh.renderable = sprite;
        batchableMesh.transform = sprite.groupTransform;
        batchableMesh.texture = sprite._texture;
        batchableMesh.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        this._managedSprites.add(sprite);

        // if the sprite has not been updated by the view, we need to update the batchable mesh now.
        if (!sprite.didViewUpdate)
        {
            this._updateBatchableSprite(sprite, batchableMesh);
        }

        return gpuData;
    }

    public execute(sprite: NineSliceSprite)
    {
        if (this._renderer.type !== RendererType.CANVAS) return;

        const renderer = this._renderer as CanvasRenderer;
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

        const finalSource = tint === 0xFFFFFF
            ? drawSource
            : canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;

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

        if (finalSource !== drawSource)
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
        this._managedSprites.destroy();
        (this._renderer as null) = null;
    }
}

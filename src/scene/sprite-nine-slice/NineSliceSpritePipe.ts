import { ExtensionType } from '../../extensions/Extensions';
import { canvasUtils } from '../../rendering/renderers/canvas/utils/canvasUtils';
import { RendererType } from '../../rendering/renderers/types';
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
        this._managedSprites = new GCManagedHash({ renderer, type: 'renderable' });
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

        const groupColorAlpha = sprite.groupColorAlpha;

        context.globalAlpha = ((groupColorAlpha >>> 24) & 0xFF) / 255;

        const color = groupColorAlpha & 0xFFFFFF;
        const tint = ((color & 0xFF) << 16) + (color & 0xFF00) + ((color >> 16) & 0xFF);
        const texture = sprite.texture;

        let drawSource: CanvasImageSource = texture.source.resource as CanvasImageSource;

        if (tint !== 0xFFFFFF)
        {
            drawSource = canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;
        }

        const {
            leftWidth,
            topHeight,
            rightWidth,
            bottomHeight,
            width,
            height,
        } = sprite;

        const anchor = sprite.anchor;

        const sx = (texture.frame.x) * texture.source.resolution;
        const sy = (texture.frame.y) * texture.source.resolution;
        const sw = (texture.frame.width) * texture.source.resolution;
        const sh = (texture.frame.height) * texture.source.resolution;

        const dx = -anchor.x * width;
        const dy = -anchor.y * height;

        const lw = leftWidth * texture.source.resolution;
        const tw = topHeight * texture.source.resolution;
        const rw = rightWidth * texture.source.resolution;
        const bw = bottomHeight * texture.source.resolution;

        // Top-left
        context.drawImage(drawSource, sx, sy, lw, tw, dx, dy, leftWidth, topHeight);
        // Top-center
        context.drawImage(
            drawSource,
            sx + lw, sy,
            sw - lw - rw, tw,
            dx + leftWidth, dy,
            width - leftWidth - rightWidth, topHeight
        );
        // Top-right
        context.drawImage(drawSource, sx + sw - rw, sy, rw, tw, dx + width - rightWidth, dy, rightWidth, topHeight);

        // Middle-left
        context.drawImage(
            drawSource,
            sx, sy + tw,
            lw, sh - tw - bw,
            dx, dy + topHeight,
            leftWidth, height - topHeight - bottomHeight
        );
        // Middle-center
        context.drawImage(
            drawSource,
            sx + lw, sy + tw,
            sw - lw - rw, sh - tw - bw,
            dx + leftWidth, dy + topHeight,
            width - leftWidth - rightWidth, height - topHeight - bottomHeight
        );
        // Middle-right
        context.drawImage(
            drawSource,
            sx + sw - rw, sy + tw,
            rw, sh - tw - bw,
            dx + width - rightWidth, dy + topHeight,
            rightWidth, height - topHeight - bottomHeight
        );

        // Bottom-left
        context.drawImage(drawSource, sx, sy + sh - bw, lw, bw, dx, dy + height - bottomHeight, leftWidth, bottomHeight);
        // Bottom-center
        context.drawImage(
            drawSource,
            sx + lw, sy + sh - bw,
            sw - lw - rw, bw,
            dx + leftWidth, dy + height - bottomHeight,
            width - leftWidth - rightWidth, bottomHeight
        );
        // Bottom-right
        context.drawImage(
            drawSource,
            sx + sw - rw, sy + sh - bw,
            rw, bw,
            dx + width - rightWidth, dy + height - bottomHeight,
            rightWidth, bottomHeight
        );

        context.restore();
    }

    public destroy()
    {
        this._managedSprites.destroy();
        (this._renderer as null) = null;
    }
}

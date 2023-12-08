import { ExtensionType } from '../../../extensions/Extensions';
import { updateQuadBounds } from '../../../utils/data/updateQuadBounds';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchableSprite } from '../../sprite/BatchableSprite';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../../rendering/renderers/types';
import type { TextView } from '../TextView';

export class CanvasTextPipe implements RenderPipe<TextView>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'text',
    } as const;

    private _renderer: Renderer;

    private _gpuText: Record<number, {
        texture: Texture,
        currentKey: string,
        batchableSprite: BatchableSprite,
    }> = Object.create(null);

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public validateRenderable(renderable: Renderable<TextView>): boolean
    {
        const gpuText = this._getGpuText(renderable);

        const newKey = renderable.view._getKey();

        if (gpuText.currentKey !== newKey)
        {
            const view = renderable.view;

            const resolution = view.resolution ?? this._renderer.resolution;

            const { width, height } = this._renderer.canvasText.getTextureSize(
                view.text,
                resolution,
                view._style,
            );

            if (
                // is only being used by this text:
                this._renderer.canvasText.getReferenceCount(gpuText.currentKey) === 1
                // check the size of the text is the same po2
                && width === gpuText.texture._source.width
                && height === gpuText.texture._source.height
            )
            {
                return false;
            }

            return true;
        }

        return false;
    }

    public addRenderable(renderable: Renderable<TextView>, _instructionSet: InstructionSet)
    {
        const gpuText = this._getGpuText(renderable);

        const batchableSprite = gpuText.batchableSprite;

        if (renderable.view._didUpdate)
        {
            this._updateText(renderable);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableSprite);
    }

    public updateRenderable(renderable: Renderable<TextView>)
    {
        const gpuText = this._getGpuText(renderable);
        const batchableSprite = gpuText.batchableSprite;

        if (renderable.view._didUpdate)
        {
            this._updateText(renderable);
        }

        batchableSprite.batcher.updateElement(batchableSprite);
    }

    public destroyRenderable(renderable: Renderable<TextView>)
    {
        this._destroyRenderableById(renderable.uid);
    }

    private _destroyRenderableById(renderableUid: number)
    {
        const gpuText = this._gpuText[renderableUid];

        this._renderer.canvasText.decreaseReferenceCount(gpuText.currentKey);

        BigPool.return(gpuText.batchableSprite);

        this._gpuText[renderableUid] = null;
    }

    private _updateText(renderable: Renderable<TextView>)
    {
        const newKey = renderable.view._getKey();
        const gpuText = this._getGpuText(renderable);
        const batchableSprite = gpuText.batchableSprite;

        if (gpuText.currentKey !== newKey)
        {
            this._updateGpuText(renderable);
        }

        renderable.view._didUpdate = false;

        const padding = renderable.view._style.padding;

        updateQuadBounds(batchableSprite.bounds, renderable.view.anchor, batchableSprite.texture, padding);
    }

    private _updateGpuText(renderable: Renderable<TextView>)
    {
        const gpuText = this._getGpuText(renderable);
        const batchableSprite = gpuText.batchableSprite;
        const view = renderable.view;

        if (gpuText.texture)
        {
            this._renderer.canvasText.decreaseReferenceCount(gpuText.currentKey);
        }

        const resolution = view.resolution ?? this._renderer.resolution;

        gpuText.texture = batchableSprite.texture = this._renderer.canvasText.getTexture(
            view.text,
            resolution,
            view._style,
            view._getKey()
        );

        gpuText.currentKey = view._getKey();
        batchableSprite.texture = gpuText.texture;
    }

    private _getGpuText(renderable: Renderable<TextView>)
    {
        return this._gpuText[renderable.uid] || this.initGpuText(renderable);
    }

    public initGpuText(renderable: Renderable<TextView>)
    {
        const gpuTextData: CanvasTextPipe['_gpuText'][number] = {
            texture: null,
            currentKey: '--',
            batchableSprite: BigPool.get(BatchableSprite),
        };

        gpuTextData.batchableSprite.renderable = renderable;
        gpuTextData.batchableSprite.bounds = { left: 0, right: 1, top: 0, bottom: 0 };
        gpuTextData.batchableSprite.roundPixels = (this._renderer._roundPixels | renderable.view.roundPixels) as 0 | 1;

        this._gpuText[renderable.uid] = gpuTextData;

        this._updateText(renderable);

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return gpuTextData;
    }

    public destroy()
    {
        for (const i in this._gpuText)
        {
            this._destroyRenderableById(i as unknown as number);
        }

        this._gpuText = null;
        this._renderer = null;
    }
}

import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchableSprite } from '../../sprite/shared/BatchableSprite';

import type { ObservablePoint } from '../../../maths/ObservablePoint';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { Renderer } from '../../renderers/types';
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
        needsTextureUpdate: boolean,
    }> = {};

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

            const resolution = view._autoResolution ? this._renderer.view.resolution : view._resolution;

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

    public addRenderable(renderable: Renderable<TextView>, instructionSet: InstructionSet)
    {
        const gpuText = this._getGpuText(renderable);

        const batchableSprite = gpuText.batchableSprite;

        if (renderable.view._didUpdate)
        {
            this._updateText(renderable);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableSprite, instructionSet);
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

        updateBounds(batchableSprite.bounds, renderable.view.anchor, batchableSprite.texture);
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

        const resolution = view._autoResolution ? this._renderer.view.resolution : view._resolution;

        gpuText.texture = batchableSprite.texture = this._renderer.canvasText.getTexture(
            view.text,
            resolution,
            view._style,
            view._getKey()
        );

        gpuText.currentKey = view._getKey();
        batchableSprite.texture = gpuText.texture;
        gpuText.needsTextureUpdate = false;
    }

    private _getGpuText(renderable: Renderable<TextView>)
    {
        return this._gpuText[renderable.uid] || this._initGpuText(renderable);
    }

    private _initGpuText(renderable: Renderable<TextView>)
    {
        const view = renderable.view;

        view._style.update();

        const gpuTextData: CanvasTextPipe['_gpuText'][number] = {
            texture: null,
            currentKey: '--',
            batchableSprite: BigPool.get(BatchableSprite),
            needsTextureUpdate: true,
        };

        gpuTextData.batchableSprite.sprite = renderable;
        gpuTextData.batchableSprite.bounds = [0, 1, 0, 0];

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

function updateBounds(bounds: [number, number, number, number], anchor: ObservablePoint, texture: Texture)
{
    const textureSource = texture._source;

    const layout = texture.layout;

    const orig = layout.orig;
    const trim = layout.trim;

    const textureSourceWidth = textureSource.width;
    const textureSourceHeight = textureSource.height;

    const width = textureSourceWidth * orig.width;
    const height = textureSourceHeight * orig.height;

    if (trim)
    {
        const sourceWidth = textureSourceWidth * trim.width;
        const sourceHeight = textureSourceHeight * trim.height;

        bounds[1] = (trim.x * textureSourceWidth) - (anchor._x * width);
        bounds[0] = bounds[1] + sourceWidth;

        bounds[3] = (trim.y * textureSourceHeight) - (anchor._y * height);
        bounds[2] = bounds[3] + sourceHeight;
    }
    else
    {
        bounds[1] = -anchor._x * width;
        bounds[0] = bounds[1] + width;

        bounds[3] = -anchor._y * height;
        bounds[2] = bounds[3] + height;
    }

    return;
}

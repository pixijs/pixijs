import { ExtensionType } from '../../extensions/Extensions';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { updateQuadBounds } from '../../utils/data/updateQuadBounds';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from '../sprite/BatchableSprite';

import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../rendering/renderers/shared/Renderable';
import type { Renderer } from '../../rendering/renderers/types';
import type { TextView } from '../text/TextView';
import type { HTMLTextStyle } from './HtmlTextStyle';

export class HTMLTextPipe implements RenderPipe<TextView>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'htmlText',
    } as const;

    private _renderer: Renderer;

    private _gpuText: Record<number, {
        textureNeedsUploading: boolean;
        generatingTexture: boolean;
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

        if (gpuText.textureNeedsUploading)
        {
            gpuText.textureNeedsUploading = false;

            return true;
        }

        if (gpuText.currentKey !== newKey)
        {
            // TODO - could look into optimising this a tad!
            // if its a single texture, then we could just swap it?
            // same for CanvasText..
            return true;
        }

        return false;
    }

    public addRenderable(renderable: Renderable<TextView>)
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

        this._renderer.htmlText.decreaseReferenceCount(gpuText.currentKey);

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
            this._updateGpuText(renderable).catch((e) =>
            {
                console.error(e);
            });
        }

        renderable.view._didUpdate = false;

        const padding = renderable.view._style.padding;

        updateQuadBounds(batchableSprite.bounds, renderable.view.anchor, batchableSprite.texture, padding);
    }

    private async _updateGpuText(renderable: Renderable<TextView>)
    {
        renderable.view._didUpdate = false;

        const gpuText = this._getGpuText(renderable);

        if (gpuText.generatingTexture) return;

        const newKey = renderable.view._getKey();

        this._renderer.htmlText.decreaseReferenceCount(gpuText.currentKey);

        gpuText.generatingTexture = true;

        gpuText.currentKey = newKey;

        const view = renderable.view;

        const resolution = view.resolution ?? this._renderer.resolution;

        const texture = await this._renderer.htmlText.getManagedTexture(
            view.text,
            resolution,
            view._style as HTMLTextStyle,
            view._getKey()
        );

        const batchableSprite = gpuText.batchableSprite;

        batchableSprite.texture = gpuText.texture = texture;

        gpuText.generatingTexture = false;

        gpuText.textureNeedsUploading = true;
        renderable.view.onUpdate();

        const padding = renderable.view._style.padding;

        updateQuadBounds(batchableSprite.bounds, renderable.view.anchor, batchableSprite.texture, padding);
    }

    private _getGpuText(renderable: Renderable<TextView>)
    {
        return this._gpuText[renderable.uid] || this.initGpuText(renderable);
    }

    public initGpuText(renderable: Renderable<TextView>)
    {
        const gpuTextData: HTMLTextPipe['_gpuText'][number] = {
            texture: Texture.EMPTY,
            currentKey: '--',
            batchableSprite: BigPool.get(BatchableSprite),
            textureNeedsUploading: false,
            generatingTexture: false,
        };

        const batchableSprite = gpuTextData.batchableSprite;

        batchableSprite.renderable = renderable;
        batchableSprite.texture = Texture.EMPTY;
        batchableSprite.bounds = { left: 0, right: 1, top: 0, bottom: 0 };
        batchableSprite.roundPixels = (this._renderer._roundPixels | renderable.view.roundPixels) as 0 | 1;

        this._gpuText[renderable.uid] = gpuTextData;

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


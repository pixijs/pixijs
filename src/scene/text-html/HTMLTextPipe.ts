import { ExtensionType } from '../../extensions/Extensions';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { updateQuadBounds } from '../../utils/data/updateQuadBounds';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from '../sprite/BatchableSprite';

import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { HTMLText } from './HTMLText';
import type { HTMLTextStyle } from './HtmlTextStyle';

export class HTMLTextPipe implements RenderPipe<HTMLText>
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

    public validateRenderable(htmlText: HTMLText): boolean
    {
        const gpuText = this._getGpuText(htmlText);

        const newKey = htmlText._getKey();

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

    public addRenderable(htmlText: HTMLText)
    {
        const gpuText = this._getGpuText(htmlText);

        const batchableSprite = gpuText.batchableSprite;

        if (htmlText._didTextUpdate)
        {
            this._updateText(htmlText);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableSprite);
    }

    public updateRenderable(htmlText: HTMLText)
    {
        const gpuText = this._getGpuText(htmlText);
        const batchableSprite = gpuText.batchableSprite;

        if (htmlText._didTextUpdate)
        {
            this._updateText(htmlText);
        }

        batchableSprite.batcher.updateElement(batchableSprite);
    }

    public destroyRenderable(htmlText: HTMLText)
    {
        this._destroyRenderableById(htmlText.uid);
    }

    private _destroyRenderableById(htmlTextUid: number)
    {
        const gpuText = this._gpuText[htmlTextUid];

        this._renderer.htmlText.decreaseReferenceCount(gpuText.currentKey);

        BigPool.return(gpuText.batchableSprite);

        this._gpuText[htmlTextUid] = null;
    }

    private _updateText(htmlText: HTMLText)
    {
        const newKey = htmlText._getKey();
        const gpuText = this._getGpuText(htmlText);
        const batchableSprite = gpuText.batchableSprite;

        if (gpuText.currentKey !== newKey)
        {
            this._updateGpuText(htmlText).catch((e) =>
            {
                console.error(e);
            });
        }

        htmlText._didTextUpdate = false;

        const padding = htmlText._style.padding;

        updateQuadBounds(batchableSprite.bounds, htmlText._anchor, batchableSprite.texture, padding);
    }

    private async _updateGpuText(htmlText: HTMLText)
    {
        htmlText._didTextUpdate = false;

        const gpuText = this._getGpuText(htmlText);

        if (gpuText.generatingTexture) return;

        const newKey = htmlText._getKey();

        this._renderer.htmlText.decreaseReferenceCount(gpuText.currentKey);

        gpuText.generatingTexture = true;

        gpuText.currentKey = newKey;

        const resolution = htmlText.resolution ?? this._renderer.resolution;

        const texture = await this._renderer.htmlText.getManagedTexture(
            htmlText.text,
            resolution,
            htmlText._style as HTMLTextStyle,
            htmlText._getKey()
        );

        const batchableSprite = gpuText.batchableSprite;

        batchableSprite.texture = gpuText.texture = texture;

        gpuText.generatingTexture = false;

        gpuText.textureNeedsUploading = true;
        htmlText.onViewUpdate();

        const padding = htmlText._style.padding;

        updateQuadBounds(batchableSprite.bounds, htmlText._anchor, batchableSprite.texture, padding);
    }

    private _getGpuText(htmlText: HTMLText)
    {
        return this._gpuText[htmlText.uid] || this.initGpuText(htmlText);
    }

    public initGpuText(htmlText: HTMLText)
    {
        const gpuTextData: HTMLTextPipe['_gpuText'][number] = {
            texture: Texture.EMPTY,
            currentKey: '--',
            batchableSprite: BigPool.get(BatchableSprite),
            textureNeedsUploading: false,
            generatingTexture: false,
        };

        const batchableSprite = gpuTextData.batchableSprite;

        batchableSprite.renderable = htmlText;
        batchableSprite.texture = Texture.EMPTY;
        batchableSprite.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        batchableSprite.roundPixels = (this._renderer._roundPixels | htmlText._roundPixels) as 0 | 1;

        this._gpuText[htmlText.uid] = gpuTextData;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        htmlText.on('destroyed', () =>
        {
            this.destroyRenderable(htmlText);
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


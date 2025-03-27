import { ExtensionType } from '../../extensions/Extensions';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from '../sprite/BatchableSprite';
import { updateTextBounds } from '../text/utils/updateTextBounds';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { Container } from '../container/Container';
import type { HTMLText } from './HTMLText';

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
        generatingTexture: boolean;
        texture: Texture,
        texturePromise: Promise<Texture>,
        batchableSprite: BatchableSprite,
    }> = Object.create(null);

    private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container) => void;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._renderer.runners.resolutionChange.add(this);
        this._renderer.renderableGC.addManagedHash(this, '_gpuText');
    }

    public resolutionChange()
    {
        for (const i in this._gpuText)
        {
            const gpuText = this._gpuText[i];

            if (!gpuText) continue;

            const text = gpuText.batchableSprite.renderable as HTMLText;

            if (text._autoResolution)
            {
                text._resolution = this._renderer.resolution;
                text.onViewUpdate();
            }
        }
    }

    public validateRenderable(htmlText: HTMLText): boolean
    {
        return htmlText._didTextUpdate;
    }

    public addRenderable(htmlText: HTMLText, instructionSet: InstructionSet)
    {
        const gpuText = this._getGpuText(htmlText);

        const batchableSprite = gpuText.batchableSprite;

        if (htmlText._didTextUpdate)
        {
            this._updateText(htmlText);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableSprite, instructionSet);
    }

    public updateRenderable(htmlText: HTMLText)
    {
        const gpuText = this._getGpuText(htmlText);
        const batchableSprite = gpuText.batchableSprite;

        if (htmlText._didTextUpdate)
        {
            this._updateText(htmlText);
        }

        batchableSprite._batcher.updateElement(batchableSprite);
    }

    public destroyRenderable(htmlText: HTMLText)
    {
        htmlText.off('destroyed', this._destroyRenderableBound);
        this._destroyRenderableById(htmlText.uid);
    }

    private _destroyRenderableById(htmlTextUid: number)
    {
        const gpuText = this._gpuText[htmlTextUid];

        this._renderer.htmlText.returnTexturePromise(gpuText.texturePromise);

        gpuText.texturePromise = null;

        BigPool.return(gpuText.batchableSprite);

        this._gpuText[htmlTextUid] = null;
    }

    private _updateText(htmlText: HTMLText)
    {
        const gpuText = this._getGpuText(htmlText);
        const batchableSprite = gpuText.batchableSprite;

        this._updateGpuText(htmlText).catch((e) =>
        {
            console.error(e);
        });

        htmlText._didTextUpdate = false;

        updateTextBounds(batchableSprite, htmlText);
    }

    private async _updateGpuText(htmlText: HTMLText)
    {
        htmlText._didTextUpdate = false;

        const gpuText = this._getGpuText(htmlText);

        if (gpuText.generatingTexture) return;

        if (gpuText.texturePromise)
        {
            this._renderer.htmlText.returnTexturePromise(gpuText.texturePromise);
            gpuText.texturePromise = null;
        }

        gpuText.generatingTexture = true;

        htmlText._resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;

        const texturePromise = this._renderer.htmlText.getTexturePromise(htmlText);

        gpuText.texturePromise = texturePromise;

        const batchableSprite = gpuText.batchableSprite;

        batchableSprite.texture = gpuText.texture = await texturePromise;

        // need a rerender...
        htmlText.parentRenderGroup.structureDidChange = true;

        gpuText.generatingTexture = false;

        updateTextBounds(batchableSprite, htmlText);
    }

    private _getGpuText(htmlText: HTMLText)
    {
        return this._gpuText[htmlText.uid] || this.initGpuText(htmlText);
    }

    public initGpuText(htmlText: HTMLText)
    {
        const gpuTextData: HTMLTextPipe['_gpuText'][number] = {
            texture: Texture.EMPTY,
            texturePromise: null,
            batchableSprite: BigPool.get(BatchableSprite),
            generatingTexture: false,
        };

        const batchableSprite = gpuTextData.batchableSprite;

        batchableSprite.renderable = htmlText;
        batchableSprite.transform = htmlText.groupTransform;
        batchableSprite.texture = Texture.EMPTY;
        batchableSprite.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        batchableSprite.roundPixels = (this._renderer._roundPixels | htmlText._roundPixels) as 0 | 1;

        htmlText._resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;
        this._gpuText[htmlText.uid] = gpuTextData;
        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        htmlText.on('destroyed', this._destroyRenderableBound);

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


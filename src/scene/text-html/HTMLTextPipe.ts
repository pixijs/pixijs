import { ExtensionType } from '../../extensions/Extensions';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { GCManagedHash } from '../../utils/data/GCManagedHash';
import { updateTextBounds } from '../text/utils/updateTextBounds';
import { BatchableHTMLText } from './BatchableHTMLText';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { HTMLText } from './HTMLText';

/**
 * The HTMLTextPipe class is responsible for rendering HTML text.
 * @internal
 */
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
    private readonly _managedTexts: GCManagedHash<HTMLText>;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        renderer.runners.resolutionChange.add(this);
        this._managedTexts = new GCManagedHash({ renderer, type: 'renderable', onUnload: this.onTextUnload.bind(this) });
    }

    protected resolutionChange()
    {
        for (const key in this._managedTexts.items)
        {
            const text = this._managedTexts.items[key];

            if (text?._autoResolution)
            {
                text.onViewUpdate();
            }
        }
    }

    public validateRenderable(htmlText: HTMLText): boolean
    {
        const gpuText = this._getGpuText(htmlText);

        const newKey = htmlText.styleKey;

        if (gpuText.currentKey !== newKey)
        {
            return true;
        }

        return false;
    }

    public addRenderable(htmlText: HTMLText, instructionSet: InstructionSet)
    {
        const batchableHTMLText = this._getGpuText(htmlText);

        if (htmlText._didTextUpdate)
        {
            const resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;

            if (batchableHTMLText.currentKey !== htmlText.styleKey || htmlText.resolution !== resolution)
            {
                // If the text has changed, we need to update the GPU text
                this._updateGpuText(htmlText).catch((e) =>
                {
                    console.error(e);
                });
            }

            htmlText._didTextUpdate = false;

            updateTextBounds(batchableHTMLText, htmlText);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableHTMLText, instructionSet);
    }

    public updateRenderable(htmlText: HTMLText)
    {
        const batchableHTMLText = this._getGpuText(htmlText);

        batchableHTMLText._batcher.updateElement(batchableHTMLText);
    }

    private async _updateGpuText(htmlText: HTMLText)
    {
        htmlText._didTextUpdate = false;
        const batchableHTMLText = this._getGpuText(htmlText);

        if (batchableHTMLText.generatingTexture) return;

        // We need to preserve the current texture and don't release it until the new texture is generated.
        // It's necessary to ensure that the texture won't be captured by another field and overwritten with their
        // content, while our texture is still in progress.
        const oldTexturePromise = batchableHTMLText.texturePromise;

        batchableHTMLText.texturePromise = null;

        batchableHTMLText.generatingTexture = true;

        htmlText._resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;

        let texturePromise = this._renderer.htmlText.getTexturePromise(htmlText);

        if (oldTexturePromise)
        {
            // Release old texture after new one is generated.
            texturePromise = texturePromise.finally(() =>
            {
                this._renderer.htmlText.decreaseReferenceCount(batchableHTMLText.currentKey);
                this._renderer.htmlText.returnTexturePromise(oldTexturePromise);
            });
        }

        batchableHTMLText.texturePromise = texturePromise;
        batchableHTMLText.currentKey = htmlText.styleKey;

        batchableHTMLText.texture = await texturePromise;

        // need a rerender...
        const renderGroup = htmlText.renderGroup || htmlText.parentRenderGroup;

        if (renderGroup)
        {
            // need a rebuild of the render group
            renderGroup.structureDidChange = true;
        }

        batchableHTMLText.generatingTexture = false;

        updateTextBounds(batchableHTMLText, htmlText);
    }

    private _getGpuText(htmlText: HTMLText)
    {
        return htmlText._gpuData[this._renderer.uid] || this.initGpuText(htmlText);
    }

    public initGpuText(htmlText: HTMLText)
    {
        const batchableHTMLText = new BatchableHTMLText();

        batchableHTMLText.renderable = htmlText;
        batchableHTMLText.transform = htmlText.groupTransform;
        batchableHTMLText.texture = Texture.EMPTY;
        batchableHTMLText.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        batchableHTMLText.roundPixels = (this._renderer._roundPixels | htmlText._roundPixels) as 0 | 1;

        htmlText._resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;
        htmlText._gpuData[this._renderer.uid] = batchableHTMLText;

        this._managedTexts.add(htmlText);

        return batchableHTMLText;
    }

    protected onTextUnload(text: HTMLText)
    {
        const gpuData = text._gpuData[this._renderer.uid];

        if (!gpuData) return;

        const { htmlText } = this._renderer;

        htmlText.getReferenceCount(gpuData.currentKey) === null
            ? htmlText.returnTexturePromise(gpuData.texturePromise)
            : htmlText.decreaseReferenceCount(gpuData.currentKey);
    }

    public destroy()
    {
        this._managedTexts.destroy();
        this._renderer = null;
    }
}


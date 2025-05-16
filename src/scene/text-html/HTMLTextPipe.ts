import { ExtensionType } from '../../extensions/Extensions';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
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

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public validateRenderable(htmlText: HTMLText): boolean
    {
        return htmlText._didTextUpdate;
    }

    public addRenderable(htmlText: HTMLText, instructionSet: InstructionSet)
    {
        const batchableHTMLText = this._getGpuText(htmlText);

        if (htmlText._didTextUpdate)
        {
            this._updateGpuText(htmlText).catch((e) =>
            {
                console.error(e);
            });

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

        if (batchableHTMLText.texturePromise)
        {
            this._renderer.htmlText.returnTexturePromise(batchableHTMLText.texturePromise);
            batchableHTMLText.texturePromise = null;
        }

        batchableHTMLText.generatingTexture = true;

        htmlText._resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;

        const texturePromise = this._renderer.htmlText.getTexturePromise(htmlText);

        batchableHTMLText.texturePromise = texturePromise;

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
        const batchableHTMLText = new BatchableHTMLText(this._renderer);

        batchableHTMLText.renderable = htmlText;
        batchableHTMLText.transform = htmlText.groupTransform;
        batchableHTMLText.texture = Texture.EMPTY;
        batchableHTMLText.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        batchableHTMLText.roundPixels = (this._renderer._roundPixels | htmlText._roundPixels) as 0 | 1;

        htmlText._resolution = htmlText._autoResolution ? this._renderer.resolution : htmlText.resolution;
        htmlText._gpuData[this._renderer.uid] = batchableHTMLText;

        return batchableHTMLText;
    }

    public destroy()
    {
        this._renderer = null;
    }
}


import { ExtensionType } from '../../../extensions/Extensions';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { updateTextBounds } from '../utils/updateTextBounds';
import { BatchableText } from './BatchableText';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Text } from '../Text';

/** @internal */
export class CanvasTextPipe implements RenderPipe<Text>
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
    private readonly _managedTexts: GCManagedHash<Text>;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        renderer.runners.resolutionChange.add(this);
        this._managedTexts = new GCManagedHash({
            renderer,
            type: 'renderable',
            onUnload: this.onTextUnload.bind(this),
            name: 'canvasText'
        });
    }

    protected resolutionChange()
    {
        for (const key in this._managedTexts.items)
        {
            const text = this._managedTexts.items[key];

            if (text?._autoResolution) text.onViewUpdate();
        }
    }

    public validateRenderable(text: Text): boolean
    {
        const gpuText = this._getGpuText(text);

        const newKey = text.styleKey;

        if (gpuText.currentKey !== newKey) return true;

        return text._didTextUpdate;
    }

    public addRenderable(text: Text, instructionSet: InstructionSet)
    {
        const batchableText = this._getGpuText(text);

        if (text._didTextUpdate)
        {
            const resolution = text._autoResolution ? this._renderer.resolution : text.resolution;

            if (batchableText.currentKey !== text.styleKey || text.resolution !== resolution)
            {
                // If the text has changed, we need to update the GPU text
                this._updateGpuText(text);
            }

            text._didTextUpdate = false;

            updateTextBounds(batchableText, text);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableText, instructionSet);
    }

    public updateRenderable(text: Text)
    {
        const batchableText = this._getGpuText(text);

        batchableText._batcher.updateElement(batchableText);
    }

    private _updateGpuText(text: Text)
    {
        const batchableText = this._getGpuText(text);

        if (batchableText.texture)
        {
            this._renderer.canvasText.decreaseReferenceCount(batchableText.currentKey);
        }

        text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;

        batchableText.texture = this._renderer.canvasText.getManagedTexture(text);
        batchableText.currentKey = text.styleKey;
    }

    private _getGpuText(text: Text)
    {
        return text._gpuData[this._renderer.uid] || this.initGpuText(text);
    }

    public initGpuText(text: Text)
    {
        const batchableText = new BatchableText();

        batchableText.currentKey = '--';
        batchableText.renderable = text;
        batchableText.transform = text.groupTransform;
        batchableText.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        batchableText.roundPixels = (this._renderer._roundPixels | text._roundPixels) as 0 | 1;

        text._gpuData[this._renderer.uid] = batchableText;
        this._managedTexts.add(text);

        return batchableText;
    }

    protected onTextUnload(text: Text)
    {
        const gpuData = text._gpuData[this._renderer.uid];

        if (!gpuData) return;

        const { canvasText } = this._renderer;
        const refCount = canvasText.getReferenceCount(gpuData.currentKey);

        if (refCount > 0)
        {
            canvasText.decreaseReferenceCount(gpuData.currentKey);
        }
        else if (gpuData.texture)
        {
            canvasText.returnTexture(gpuData.texture);
        }
    }

    public destroy()
    {
        this._managedTexts.destroy();
        this._renderer = null;
    }
}

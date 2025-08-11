import { ExtensionType } from '../../../extensions/Extensions';
import { updateTextBounds } from '../utils/updateTextBounds';
import { BatchableText } from './BatchableText';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Text } from '../Text';

const typeSymbol = Symbol.for('pixijs.CanvasTextPipe');

/** @internal */
export class CanvasTextPipe implements RenderPipe<Text>
{
    /**
     * Type symbol used to identify instances of CanvasTextPipe.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a CanvasTextPipe.
     * @param obj - The object to check.
     * @returns True if the object is a CanvasTextPipe, false otherwise.
     */
    public static isCanvasTextPipe(obj: any): obj is CanvasTextPipe
    {
        return !!obj && !!obj[typeSymbol];
    }

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

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public validateRenderable(text: Text): boolean
    {
        return text._didTextUpdate;
    }

    public addRenderable(text: Text, instructionSet: InstructionSet)
    {
        const batchableText = this._getGpuText(text);

        if (text._didTextUpdate)
        {
            this._updateGpuText(text);
            text._didTextUpdate = false;
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
            this._renderer.canvasText.returnTexture(batchableText.texture);
        }

        text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;

        batchableText.texture = this._renderer.canvasText.getTexture(text);

        updateTextBounds(batchableText, text);
    }

    private _getGpuText(text: Text)
    {
        return text._gpuData[this._renderer.uid] || this.initGpuText(text);
    }

    public initGpuText(text: Text)
    {
        const batchableText = new BatchableText(this._renderer);

        batchableText.renderable = text;
        batchableText.transform = text.groupTransform;
        batchableText.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        batchableText.roundPixels = (this._renderer._roundPixels | text._roundPixels) as 0 | 1;

        text._gpuData[this._renderer.uid] = batchableText;

        return batchableText;
    }

    public destroy()
    {
        this._renderer = null;
    }
}

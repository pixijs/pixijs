import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchableSprite } from '../../sprite/BatchableSprite';
import { updateTextBounds } from '../utils/updateTextBounds';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Container } from '../../container/Container';
import type { Text } from '../Text';

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

    private _gpuText: Record<number, {
        texture: Texture,
        currentKey: string,
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

            const text = gpuText.batchableSprite.renderable as Text;

            if (text._autoResolution)
            {
                text._resolution = this._renderer.resolution;
                text.onViewUpdate();
            }
        }
    }

    public validateRenderable(text: Text): boolean
    {
        const gpuText = this._getGpuText(text);

        const newKey = text._getKey();

        if (gpuText.currentKey !== newKey)
        {
            return true;
        }

        return false;
    }

    public addRenderable(text: Text, instructionSet: InstructionSet)
    {
        const gpuText = this._getGpuText(text);

        const batchableSprite = gpuText.batchableSprite;

        if (text._didTextUpdate)
        {
            this._updateText(text);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableSprite, instructionSet);
    }

    public updateRenderable(text: Text)
    {
        const gpuText = this._getGpuText(text);
        const batchableSprite = gpuText.batchableSprite;

        if (text._didTextUpdate)
        {
            this._updateText(text);
        }

        batchableSprite._batcher.updateElement(batchableSprite);
    }

    public destroyRenderable(text: Text)
    {
        text.off('destroyed', this._destroyRenderableBound);

        this._destroyRenderableById(text.uid);
    }

    private _destroyRenderableById(textUid: number)
    {
        const gpuText = this._gpuText[textUid];

        this._renderer.canvasText.decreaseReferenceCount(gpuText.currentKey);

        BigPool.return(gpuText.batchableSprite);

        this._gpuText[textUid] = null;
    }

    private _updateText(text: Text)
    {
        const newKey = text._getKey();
        const gpuText = this._getGpuText(text);
        const batchableSprite = gpuText.batchableSprite;

        if (gpuText.currentKey !== newKey)
        {
            this._updateGpuText(text);
        }

        text._didTextUpdate = false;

        updateTextBounds(batchableSprite, text);
    }

    private _updateGpuText(text: Text)
    {
        const gpuText = this._getGpuText(text);
        const batchableSprite = gpuText.batchableSprite;

        if (gpuText.texture)
        {
            this._renderer.canvasText.decreaseReferenceCount(gpuText.currentKey);
        }

        gpuText.texture = batchableSprite.texture = this._renderer.canvasText.getManagedTexture(text);
        gpuText.currentKey = text._getKey();
        batchableSprite.texture = gpuText.texture;
    }

    private _getGpuText(text: Text)
    {
        return this._gpuText[text.uid] || this.initGpuText(text);
    }

    public initGpuText(text: Text)
    {
        const gpuTextData: CanvasTextPipe['_gpuText'][number] = {
            texture: null,
            currentKey: '--',
            batchableSprite: BigPool.get(BatchableSprite),
        };

        gpuTextData.batchableSprite.renderable = text;
        gpuTextData.batchableSprite.transform = text.groupTransform;
        gpuTextData.batchableSprite.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        gpuTextData.batchableSprite.roundPixels = (this._renderer._roundPixels | text._roundPixels) as 0 | 1;

        this._gpuText[text.uid] = gpuTextData;

        text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;
        this._updateText(text);

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        text.on('destroyed', this._destroyRenderableBound);

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

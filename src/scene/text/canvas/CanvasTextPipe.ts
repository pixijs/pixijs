import { ExtensionType } from '../../../extensions/Extensions';
import { updateQuadBounds } from '../../../utils/data/updateQuadBounds';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchableSprite } from '../../sprite/BatchableSprite';

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
    }

    public resolutionChange()
    {
        for (const i in this._gpuText)
        {
            const gpuText = this._gpuText[i];
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
            const { width, height } = this._renderer.canvasText.getTextureSize(
                text.text,
                text.resolution,
                text._style,
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

    public addRenderable(text: Text, _instructionSet: InstructionSet)
    {
        const gpuText = this._getGpuText(text);

        const batchableSprite = gpuText.batchableSprite;

        if (text.didViewUpdate)
        {
            this._updateText(text);
        }

        this._renderer.renderPipes.batch.addToBatch(batchableSprite);
    }

    public updateRenderable(text: Text)
    {
        const gpuText = this._getGpuText(text);
        const batchableSprite = gpuText.batchableSprite;

        if (text.didViewUpdate)
        {
            this._updateText(text);
        }

        batchableSprite.batcher.updateElement(batchableSprite);
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

        const padding = text._style.padding;

        updateQuadBounds(batchableSprite.bounds, text._anchor, batchableSprite.texture, padding, true);
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
        gpuTextData.batchableSprite.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
        gpuTextData.batchableSprite.roundPixels = (this._renderer._roundPixels | text._roundPixels) as 0 | 1;

        this._gpuText[text.uid] = gpuTextData;

        text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;
        // this._updateText(text);

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

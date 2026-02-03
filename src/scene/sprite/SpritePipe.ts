import { ExtensionType } from '../../extensions/Extensions';
import { BatchableSprite } from './BatchableSprite';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { Sprite } from './Sprite';

/** @internal */
export class SpritePipe implements RenderPipe<Sprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'sprite',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addRenderable(sprite: Sprite, instructionSet: InstructionSet)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        // TODO visibility
        this._renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
    }

    public updateRenderable(sprite: Sprite)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        gpuSprite._batcher.updateElement(gpuSprite);
    }

    public validateRenderable(sprite: Sprite): boolean
    {
        const gpuSprite = this._getGpuSprite(sprite);

        return !gpuSprite._batcher.checkAndUpdateTexture(
            gpuSprite,
            sprite._texture)
        ;
    }

    private _updateBatchableSprite(sprite: Sprite, batchableSprite: BatchableSprite)
    {
        batchableSprite.bounds = sprite.visualBounds;
        batchableSprite.texture = sprite._texture;
    }

    private _getGpuSprite(sprite: Sprite): BatchableSprite
    {
        return sprite._gpuData[this._renderer.uid] || this._initGPUSprite(sprite);
    }

    private _initGPUSprite(sprite: Sprite): BatchableSprite
    {
        const batchableSprite = new BatchableSprite();

        batchableSprite.renderable = sprite;

        batchableSprite.transform = sprite.groupTransform;
        batchableSprite.texture = sprite._texture;
        batchableSprite.bounds = sprite.visualBounds;
        batchableSprite.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        sprite._gpuData[this._renderer.uid] = batchableSprite;

        return batchableSprite;
    }

    public destroy()
    {
        this._renderer = null;
    }
}

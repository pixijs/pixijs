import { ExtensionType } from '../../extensions/Extensions';
import { BatchableSprite } from './BatchableSprite';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { Sprite } from './Sprite';

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

    public addRenderable(sprite: Sprite, _instructionSet: InstructionSet)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite._didSpriteUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        // TODO visibility
        this._renderer.renderPipes.batch.addToBatch(gpuSprite);
    }

    public updateRenderable(sprite: Sprite)
    {
        const gpuSprite = sprite._cache;

        if (sprite._didSpriteUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        gpuSprite.batcher.updateElement(gpuSprite);
    }

    public validateRenderable(sprite: Sprite): boolean
    {
        const texture = sprite._texture;
        const gpuSprite = this._getGpuSprite(sprite);

        if (gpuSprite.texture._source !== texture._source)
        {
            return !gpuSprite.batcher.checkAndUpdateTexture(gpuSprite, texture);
        }

        return false;
    }

    private _updateBatchableSprite(sprite: Sprite, batchableSprite: BatchableSprite)
    {
        sprite._didSpriteUpdate = false;
        batchableSprite.bounds = sprite.bounds;
        batchableSprite.texture = sprite._texture;
    }

    private _getGpuSprite(sprite: Sprite): BatchableSprite
    {
        return sprite._cache || this._initGPUSprite(sprite);
    }

    private _initGPUSprite(sprite: Sprite): BatchableSprite
    {
        const batchableSprite = new BatchableSprite();

        batchableSprite.renderable = sprite;

        batchableSprite.texture = sprite._texture;
        batchableSprite.bounds = sprite.bounds;
        batchableSprite.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        sprite._cache = batchableSprite;

        sprite._didSpriteUpdate = false;

        return batchableSprite;
    }

    public destroy()
    {
        this._renderer = null;
    }
}

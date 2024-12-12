import { ExtensionType } from '../../extensions/Extensions';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from './BatchableSprite';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { PoolItem } from '../../utils/pool/Pool';
import type { Container } from '../container/Container';
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
    private _gpuSpriteHash: Record<number, BatchableSprite> = Object.create(null);
    private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container) => void;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._renderer.renderableGC.addManagedHash(this, '_gpuSpriteHash');
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
        const gpuSprite = this._gpuSpriteHash[sprite.uid];

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

    public destroyRenderable(sprite: Sprite)
    {
        const batchableSprite = this._gpuSpriteHash[sprite.uid];

        // this will call reset!
        BigPool.return(batchableSprite as PoolItem);

        this._gpuSpriteHash[sprite.uid] = null;

        sprite.off('destroyed', this._destroyRenderableBound);
    }

    private _updateBatchableSprite(sprite: Sprite, batchableSprite: BatchableSprite)
    {
        batchableSprite.bounds = sprite.visualBounds;
        batchableSprite.texture = sprite._texture;
    }

    private _getGpuSprite(sprite: Sprite): BatchableSprite
    {
        return this._gpuSpriteHash[sprite.uid] || this._initGPUSprite(sprite);
    }

    private _initGPUSprite(sprite: Sprite): BatchableSprite
    {
        const batchableSprite = BigPool.get(BatchableSprite);

        batchableSprite.renderable = sprite;

        batchableSprite.transform = sprite.groupTransform;
        batchableSprite.texture = sprite._texture;
        batchableSprite.bounds = sprite.visualBounds;
        batchableSprite.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        this._gpuSpriteHash[sprite.uid] = batchableSprite;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        sprite.on('destroyed', this._destroyRenderableBound);

        return batchableSprite;
    }

    public destroy()
    {
        for (const i in this._gpuSpriteHash)
        {
            BigPool.return(this._gpuSpriteHash[i] as PoolItem);
        }

        this._gpuSpriteHash = null;
        this._renderer = null;
    }
}

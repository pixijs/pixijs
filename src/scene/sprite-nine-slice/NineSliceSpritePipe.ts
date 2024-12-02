import { ExtensionType } from '../../extensions/Extensions';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableMesh } from '../mesh/shared/BatchableMesh';
import { NineSliceGeometry } from './NineSliceGeometry';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { PoolItem } from '../../utils/pool/Pool';
import type { Container } from '../container/Container';
import type { NineSliceSprite } from './NineSliceSprite';

export class NineSliceSpritePipe implements RenderPipe<NineSliceSprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'nineSliceSprite',
    } as const;

    private readonly _renderer: Renderer;
    private readonly _gpuSpriteHash: Record<number, BatchableMesh> = Object.create(null);
    private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container) => void;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._renderer.renderableGC.addManagedHash(this, '_gpuSpriteHash');
    }

    public addRenderable(sprite: NineSliceSprite, instructionSet: InstructionSet)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        this._renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
    }

    public updateRenderable(sprite: NineSliceSprite)
    {
        const gpuSprite = this._gpuSpriteHash[sprite.uid];

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        gpuSprite._batcher.updateElement(gpuSprite);
    }

    public validateRenderable(sprite: NineSliceSprite): boolean
    {
        const gpuSprite = this._getGpuSprite(sprite);

        return !gpuSprite._batcher.checkAndUpdateTexture(
            gpuSprite,
            sprite._texture
        );
    }

    public destroyRenderable(sprite: NineSliceSprite)
    {
        const batchableMesh = this._gpuSpriteHash[sprite.uid];

        // this will call reset!
        BigPool.return(batchableMesh.geometry as PoolItem);
        BigPool.return(batchableMesh as PoolItem);

        this._gpuSpriteHash[sprite.uid] = null;

        sprite.off('destroyed', this._destroyRenderableBound);
    }

    private _updateBatchableSprite(sprite: NineSliceSprite, batchableSprite: BatchableMesh)
    {
        (batchableSprite.geometry as NineSliceGeometry)
            .update(sprite);

        // = sprite.bounds;
        batchableSprite.texture = sprite._texture;
    }

    private _getGpuSprite(sprite: NineSliceSprite): BatchableMesh
    {
        return this._gpuSpriteHash[sprite.uid] || this._initGPUSprite(sprite);
    }

    private _initGPUSprite(sprite: NineSliceSprite): BatchableMesh
    {
        const batchableMesh = BigPool.get(BatchableMesh);

        batchableMesh.geometry = BigPool.get(NineSliceGeometry);
        batchableMesh.renderable = sprite;
        batchableMesh.transform = sprite.groupTransform;
        batchableMesh.texture = sprite._texture;
        batchableMesh.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        this._gpuSpriteHash[sprite.uid] = batchableMesh;

        // if the sprite has not been updated by the view, we need to update the batchable mesh now.
        if (!sprite.didViewUpdate)
        {
            this._updateBatchableSprite(sprite, batchableMesh);
        }

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        sprite.on('destroyed', this._destroyRenderableBound);

        return batchableMesh;
    }

    public destroy()
    {
        for (const i in this._gpuSpriteHash)
        {
            const batchableMesh = this._gpuSpriteHash[i];

            batchableMesh.geometry.destroy();
        }

        (this._gpuSpriteHash as null) = null;
        (this._renderer as null) = null;
    }
}

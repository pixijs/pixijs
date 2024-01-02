import { ExtensionType } from '../../extensions/Extensions';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableMesh } from '../mesh/shared/BatchableMesh';
import { NineSliceGeometry } from './NineSliceGeometry';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { PoolItem } from '../../utils/pool/Pool';
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

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addRenderable(sprite: NineSliceSprite, _instructionSet: InstructionSet)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite._didSpriteUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        this._renderer.renderPipes.batch.addToBatch(gpuSprite);
    }

    public updateRenderable(sprite: NineSliceSprite)
    {
        const gpuSprite = this._gpuSpriteHash[sprite.uid];

        if (sprite._didSpriteUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        gpuSprite.batcher.updateElement(gpuSprite);
    }

    public validateRenderable(sprite: NineSliceSprite): boolean
    {
        const texture = sprite._texture;
        const gpuSprite = this._getGpuSprite(sprite);

        if (gpuSprite.texture._source !== texture._source)
        {
            return !gpuSprite.batcher.checkAndUpdateTexture(gpuSprite, texture);
        }

        return false;
    }

    public destroyRenderable(sprite: NineSliceSprite)
    {
        const batchableSprite = this._gpuSpriteHash[sprite.uid];

        // this will call reset!
        BigPool.return(batchableSprite as PoolItem);

        this._gpuSpriteHash[sprite.uid] = null;
    }

    private _updateBatchableSprite(sprite: NineSliceSprite, batchableSprite: BatchableMesh)
    {
        sprite._didSpriteUpdate = false;
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
        const batchableMesh = new BatchableMesh();

        batchableMesh.geometry = new NineSliceGeometry();

        batchableMesh.mesh = sprite;

        batchableMesh.texture = sprite._texture;
        batchableMesh.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        this._gpuSpriteHash[sprite.uid] = batchableMesh;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        sprite.on('destroyed', () =>
        {
            this.destroyRenderable(sprite);
        });

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

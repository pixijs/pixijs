import { ExtensionType } from '../../extensions/Extensions';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from './BatchableSprite';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../rendering/renderers/shared/Renderable';
import type { Renderer } from '../../rendering/renderers/types';
import type { PoolItem } from '../../utils/pool/Pool';
import type { SpriteView } from './SpriteView';

let gpuSpriteHash: Record<number, BatchableSprite>;

export class SpritePipe implements RenderPipe<SpriteView>
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

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        gpuSpriteHash = this._gpuSpriteHash;
    }

    public addRenderable(renderable: Renderable<SpriteView>, _instructionSet: InstructionSet)
    {
        const gpuSprite = this._getGpuSprite(renderable);

        if (renderable.view._didUpdate) this._updateBatchableSprite(renderable, gpuSprite);

        // TODO visibility
        this._renderer.renderPipes.batch.addToBatch(gpuSprite);
    }

    public updateRenderable(renderable: Renderable<SpriteView>)
    {
        const gpuSprite = gpuSpriteHash[renderable.uid];

        if (renderable.view._didUpdate) this._updateBatchableSprite(renderable, gpuSprite);

        gpuSprite.batcher.updateElement(gpuSprite);
    }

    public validateRenderable(renderable: Renderable<SpriteView>): boolean
    {
        const texture = renderable.view._texture;
        const gpuSprite = this._getGpuSprite(renderable);

        if (gpuSprite.texture._source !== texture._source)
        {
            return !gpuSprite.batcher.checkAndUpdateTexture(gpuSprite, texture);
        }

        return false;
    }

    public destroyRenderable(renderable: Renderable<SpriteView>)
    {
        const batchableSprite = gpuSpriteHash[renderable.uid];

        // this will call reset!
        BigPool.return(batchableSprite as PoolItem);

        gpuSpriteHash[renderable.uid] = null;
    }

    private _updateBatchableSprite(renderable: Renderable<SpriteView>, batchableSprite: BatchableSprite)
    {
        const view = renderable.view;

        view._didUpdate = false;
        batchableSprite.bounds = view.bounds;
        batchableSprite.texture = view._texture;
    }

    private _getGpuSprite(renderable: Renderable<SpriteView>): BatchableSprite
    {
        return gpuSpriteHash[renderable.uid] || this._initGPUSprite(renderable);
    }

    private _initGPUSprite(renderable: Renderable<SpriteView>): BatchableSprite
    {
        const batchableSprite = BigPool.get(BatchableSprite);

        batchableSprite.renderable = renderable;

        const view = renderable.view;

        batchableSprite.texture = view._texture;
        batchableSprite.bounds = view.bounds;
        batchableSprite.roundPixels = (this._renderer._roundPixels | view.roundPixels) as 0 | 1;

        gpuSpriteHash[renderable.uid] = batchableSprite;

        renderable.view._didUpdate = false;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

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

import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchableSprite } from './BatchableSprite';

import type { PoolItem } from '../../../utils/pool/Pool';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
import type { SpriteView } from './SpriteView';

let gpuSpriteHash: Record<number, BatchableSprite>;

export class SpritePipe implements RenderPipe<SpriteView>
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'sprite',
    } as const;

    private renderer: Renderer;
    private gpuSpriteHash: Record<number, BatchableSprite> = {};

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        gpuSpriteHash = this.gpuSpriteHash;
    }

    addRenderable(renderable: Renderable<SpriteView>, instructionSet: InstructionSet)
    {
        const gpuSprite = this.getGpuSprite(renderable);

        if (renderable.view._didUpdate) this.updateBatchableSprite(renderable, gpuSprite);

        // TODO visibility
        this.renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
    }

    updateRenderable(renderable: Renderable<SpriteView>)
    {
        const gpuSprite = gpuSpriteHash[renderable.uid];

        if (renderable.view._didUpdate) this.updateBatchableSprite(renderable, gpuSprite);

        gpuSprite.batcher.updateElement(gpuSprite);
    }

    validateRenderable(renderable: Renderable<SpriteView>): boolean
    {
        const texture = renderable.view._texture;
        const gpuSprite = this.getGpuSprite(renderable);

        if (gpuSprite.texture._source !== texture._source)
        {
            return !gpuSprite.batcher.checkAndUpdateTexture(gpuSprite, texture);
        }

        return false;
    }

    destroyRenderable(renderable: Renderable<SpriteView>)
    {
        const batchableSprite = gpuSpriteHash[renderable.uid];

        // this will call reset!
        BigPool.return(batchableSprite as PoolItem);

        gpuSpriteHash[renderable.uid] = null;
    }

    updateBatchableSprite(renderable: Renderable<SpriteView>, batchableSprite: BatchableSprite)
    {
        const view = renderable.view;

        view._didUpdate = false;
        batchableSprite.bounds = view.bounds;
        batchableSprite.texture = view._texture;
    }

    getGpuSprite(renderable: Renderable<SpriteView>): BatchableSprite
    {
        return gpuSpriteHash[renderable.uid] || this.initGPUSprite(renderable);
    }

    initGPUSprite(renderable: Renderable<SpriteView>): BatchableSprite
    {
        const batchableSprite = BigPool.get(BatchableSprite);

        batchableSprite.sprite = renderable;
        batchableSprite.texture = renderable.view._texture;
        batchableSprite.bounds = renderable.view.bounds;

        gpuSpriteHash[renderable.uid] = batchableSprite;

        renderable.view._didUpdate = false;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return batchableSprite;
    }

    destroy()
    {
        for (const i in this.gpuSpriteHash)
        {
            BigPool.return(this.gpuSpriteHash[i] as PoolItem);
        }

        this.gpuSpriteHash = null;
        this.renderer = null;
    }
}

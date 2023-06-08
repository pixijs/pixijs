import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchableSprite } from './BatchableSprite';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
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
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'sprite',
    };

    private renderer: Renderer;
    private gpuSpriteHash: Record<number, BatchableSprite> = {};

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        gpuSpriteHash = this.gpuSpriteHash;
    }

    addRenderable(sprite: Renderable<SpriteView>, instructionSet: InstructionSet)
    {
        const gpuSprite = this.getGpuSprite(sprite);

        if (sprite.view.didUpdate) this.updateBatchableSprite(sprite, gpuSprite);

        // TODO visibility
        this.renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
    }

    updateRenderable(sprite: Renderable<SpriteView>)
    {
        const gpuSprite = gpuSpriteHash[sprite.uid];

        if (sprite.view.didUpdate) this.updateBatchableSprite(sprite, gpuSprite);

        gpuSprite.batcher.updateElement(gpuSprite);
    }

    validateRenderable(sprite: Renderable<SpriteView>): boolean
    {
        const texture = sprite.view._texture;
        const gpuSprite = this.getGpuSprite(sprite);

        if (gpuSprite.texture._source !== texture._source)
        {
            return gpuSprite.batcher.checkAndUpdateTexture(gpuSprite, texture);
        }

        return false;
    }

    destroyRenderable(sprite: Renderable<SpriteView>)
    {
        const batchableSprite = gpuSpriteHash[sprite.uid];

        // this will call reset!
        BigPool.return(batchableSprite as PoolItem);

        gpuSpriteHash[sprite.uid] = null;
    }

    updateBatchableSprite(sprite: Renderable<SpriteView>, batchableSprite: BatchableSprite)
    {
        const view = sprite.view;

        view.didUpdate = false;
        batchableSprite.bounds = view.bounds;
        batchableSprite.texture = view._texture;
    }

    getGpuSprite(sprite: Renderable<SpriteView>): BatchableSprite
    {
        return gpuSpriteHash[sprite.uid] || this.initGPUSprite(sprite);
    }

    initGPUSprite(sprite: Renderable<SpriteView>): BatchableSprite
    {
        const batchableSprite = BigPool.get(BatchableSprite);

        batchableSprite.sprite = sprite;
        batchableSprite.texture = sprite.view._texture;
        batchableSprite.bounds = sprite.view.bounds;

        gpuSpriteHash[sprite.uid] = batchableSprite;

        sprite.view.didUpdate = false;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        sprite.onDestroyed = () =>
        {
            this.destroyRenderable(sprite);
        };

        return batchableSprite;
    }
}

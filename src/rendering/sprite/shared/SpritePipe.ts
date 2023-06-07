import { ExtensionType } from '../../../extensions/Extensions';
import { BatchableSprite } from './BatchableSprite';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
import type { SpriteView } from './SpriteView';

const gpuSpriteHash: Record<number, BatchableSprite> = {};

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

    renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
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
        const batchableSprite = new BatchableSprite();

        batchableSprite.sprite = sprite;
        batchableSprite.texture = sprite.view._texture;
        batchableSprite.bounds = sprite.view.bounds;

        gpuSpriteHash[sprite.uid] = batchableSprite;

        sprite.view.didUpdate = false;

        return batchableSprite;
    }
}

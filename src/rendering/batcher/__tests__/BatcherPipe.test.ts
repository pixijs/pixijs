import { getWebGLRenderer } from '@test-utils';
import { CanvasRenderer } from '~/rendering/renderers/canvas/CanvasRenderer';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

import type { Batch, Batcher } from '../shared/Batcher';
import type { BatcherPipe } from '../shared/BatcherPipe';
import type { WebGLRenderer } from '~/rendering/renderers/gl/WebGLRenderer';

describe('BatcherPipe', () =>
{
    it('should release cached batchers when the owning container is destroyed', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const batchPipe = renderer.renderPipes.batch as unknown as BatcherPipe;

        const cache = batchPipe['_batchersByInstructionSet'] as Record<number, unknown>;

        const container = new Container({ isRenderGroup: true });

        container.addChild(new Sprite(Texture.WHITE));

        renderer.render(container);

        const uid = container.renderGroup.instructionSet.uid;

        // Sanity check: rendering populated the per-instructionSet batcher cache.
        expect(cache[uid]).toBeDefined();

        container.destroy({ children: true });

        // should not leak: entry should not survive RenderGroup destruction.
        expect(cache[uid]).toBeUndefined();

        renderer.destroy();
    });

    it('should only upload quad indices when they change', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const container = new Container({ isRenderGroup: true });

        const addSprites = (count: number) =>
        {
            for (let i = 0; i < count; i++) container.addChild(new Sprite(Texture.WHITE));
        };

        addSprites(4);
        renderer.render(container);

        const batcher = container.renderGroup.instructionSet.renderPipes.batch['_activeBatch'] as Batcher;
        const spy = jest.spyOn(batcher.geometry.indexBuffer, 'setDataWithSize');

        // a rebuild with the same quads leaves the indices alone
        container.removeChildAt(0).destroy();
        addSprites(1);
        renderer.render(container);

        expect(spy).not.toHaveBeenCalled();

        // more quads than were uploaded
        addSprites(2);
        renderer.render(container);

        expect(spy).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('should only fill batch elements for the canvas renderer', async () =>
    {
        const container = new Container({ isRenderGroup: true });

        container.addChild(new Sprite(Texture.WHITE), new Sprite(Texture.WHITE));

        const webgl = (await getWebGLRenderer()) as WebGLRenderer;

        webgl.render(container);

        const glBatch = container.renderGroup.instructionSet.instructions[0] as Batch;

        expect(glBatch.renderPipeId).toBe('batch');
        expect(glBatch.elements).toBeNull();

        webgl.destroy();

        const canvas = new CanvasRenderer();

        await canvas.init({ width: 2, height: 2 });
        container.children[0].x = 1;
        container.addChild(new Sprite(Texture.WHITE));
        canvas.render(container);

        const canvasBatch = container.renderGroup.instructionSet.instructions[0] as Batch;

        expect(canvasBatch.renderPipeId).toBe('batch');
        expect(canvasBatch.elements).toHaveLength(3);

        canvas.destroy();
    });
});

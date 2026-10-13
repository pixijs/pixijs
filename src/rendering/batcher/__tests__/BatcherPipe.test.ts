import { getWebGLRenderer } from '@test-utils';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

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
});

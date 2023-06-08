import { Graphics } from '../../../src/rendering/graphics/shared/Graphics';
import { WebGLRenderer } from '../../../src/rendering/renderers/gl/WebGLRenderer';
import { Container } from '../../../src/rendering/scene/Container';

import type { Renderer } from '../../../src/rendering/renderers/types';

async function getRenderer(): Promise<Renderer>
{
    const renderer = new WebGLRenderer();

    await renderer.init({
        width: 100,
        height: 100,
    });

    return renderer;
}

describe('Graphics', () =>
{
    it('should not throw when destroyed', () =>
    {
        const graphics = new Graphics();

        expect(() => graphics.destroy()).not.toThrow();
    });

    it('should not throw when destroying it context', () =>
    {
        const graphics = new Graphics();

        expect(() => graphics.destroy(true)).not.toThrow();
    });

    it('should clean up correctly on the pipe and system when destroyed', async () =>
    {
        const renderer = await getRenderer();

        const container = new Container();

        const graphics = new Graphics();

        graphics.context.rect(0, 0, 100, 100).fill(0xFF0000);

        container.addChild(graphics);

        renderer.render(container);

        // we will lose this ref once its destroyed:
        const context = graphics.context;

        graphics.destroy();

        expect(graphics.context).toBeNull();

        expect(renderer.renderPipes.graphics['renderableBatchesHash'][graphics.uid]).toBeNull();

        expect(renderer.graphicsContext['gpuContextHash'][context.uid]).not.toBeNull();
        expect(renderer.graphicsContext['gpuContextHash'][context.uid]).not.toBeNull();

        context.destroy(true);

        expect(renderer.graphicsContext['gpuContextHash'][context.uid]).toBeNull();
        expect(renderer.graphicsContext['gpuContextHash'][context.uid]).toBeNull();

        expect(context.instructions).toBeNull();
    });
});

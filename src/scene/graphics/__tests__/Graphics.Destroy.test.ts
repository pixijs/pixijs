import { Container } from '../../container/Container';
import { Graphics } from '../shared/Graphics';
import { GraphicsContext } from '../shared/GraphicsContext';
import '../init';
import { getWebGLRenderer } from '@test-utils';

describe('Graphics Destroy', () =>
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
        const renderer = await getWebGLRenderer();

        const container = new Container();

        const graphics = new Graphics();

        graphics.context.rect(0, 0, 100, 100).fill(0xFF0000);

        container.addChild(graphics);

        renderer.render({ container });

        // we will lose this ref once its destroyed:
        const context = graphics.context;

        graphics.destroy({ context: false });

        expect(graphics.context).toBeNull();

        expect(renderer.renderPipes.graphics['_graphicsBatchesHash'][graphics.uid]).toBeNull();

        expect(renderer.graphicsContext['_gpuContextHash'][context.uid]).not.toBeNull();
        expect(renderer.graphicsContext['_gpuContextHash'][context.uid]).not.toBeNull();

        context.destroy(true);

        expect(renderer.graphicsContext['_gpuContextHash'][context.uid]).toBeNull();
        expect(renderer.graphicsContext['_gpuContextHash'][context.uid]).toBeNull();

        expect(context.instructions).toBeNull();
    });

    it('should destroy its own context', async () =>
    {
        const g = new Graphics();

        const context = g.context;

        // listen to function..
        const spy = jest.fn();

        context.on('destroy', spy);

        g.destroy();

        expect(spy).toHaveBeenCalled();
    });

    it('should not destroy its context if its managed externally', async () =>
    {
        const context = new GraphicsContext();

        const g = new Graphics(context);

        // listen to function..
        const spy = jest.fn();

        context.on('destroy', spy);

        g.destroy();

        expect(spy).not.toHaveBeenCalled();
    });
});

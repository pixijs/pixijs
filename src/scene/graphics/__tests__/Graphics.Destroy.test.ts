import { Container } from '../../container/Container';
import { FillGradient } from '../shared/fill/FillGradient';
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
        const gpuContextData = graphics.context._gpuData[renderer.uid];
        const spy = jest.spyOn(gpuContextData, 'destroy');

        graphics.destroy({ context: false });

        expect(graphics.context).toBeNull();
        expect(graphics._gpuData).toBeEmptyObject();
        expect(spy).not.toHaveBeenCalled();

        context.destroy(true);

        expect(spy).toHaveBeenCalledOnce();

        expect(context.instructions).toBeNull();
    });

    it('should clean up its fill when destroyed', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container();

        const graphics = new Graphics();
        const fill = new FillGradient({});

        graphics.context.rect(0, 0, 100, 100).fill(fill);

        container.addChild(graphics);

        renderer.render({ container });

        // we will lose this ref once its destroyed:
        const context = graphics.context;

        graphics.destroy({ context: false });

        expect(fill.texture).not.toBeNull();
        expect(fill.transform).not.toBeNull();

        context.destroy(true);

        expect(fill.texture).toBeNull();
        expect(fill.transform).toBeNull();
        expect(fill.colorStops).toEqual([]);
        expect(fill.start).toBeNull();
        expect(fill.end).toBeNull();
        expect(fill.center).toBeNull();
        expect(fill.outerCenter).toBeNull();
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

    it('should unregister from its own context when the context is preserved', () =>
    {
        const graphics = new Graphics();
        const context = graphics.context;

        expect(context.listenerCount('update')).toBe(1);
        expect(context.listenerCount('unload')).toBe(1);

        graphics.destroy({ context: false });

        expect(context.destroyed).toBe(false);
        expect(context.listenerCount('update')).toBe(0);
        expect(context.listenerCount('unload')).toBe(0);
    });

    it('should not destroy its context if its managed externally', async () =>
    {
        const context = new GraphicsContext();

        const g = new Graphics(context);

        // listen to function..
        const spy = jest.fn();

        context.on('destroy', spy);

        expect(context.listenerCount('update')).toBe(1);
        expect(context.listenerCount('unload')).toBe(1);

        g.destroy();

        expect(spy).not.toHaveBeenCalled();
        expect(context.listenerCount('update')).toBe(0);
        expect(context.listenerCount('unload')).toBe(0);
    });

    it('should only unregister the destroyed graphics from a shared context', () =>
    {
        const context = new GraphicsContext();
        const graphicsA = new Graphics(context);
        const graphicsB = new Graphics(context);

        expect(context.listenerCount('update')).toBe(2);
        expect(context.listenerCount('unload')).toBe(2);

        graphicsA.destroy();

        expect(context.listenerCount('update')).toBe(1);
        expect(context.listenerCount('unload')).toBe(1);

        graphicsB.didViewUpdate = false;
        context.rect(0, 0, 10, 10).fill(0xFF0000);

        expect(graphicsB.didViewUpdate).toBe(true);

        graphicsB.destroy();

        expect(context.listenerCount('update')).toBe(0);
        expect(context.listenerCount('unload')).toBe(0);
    });
});

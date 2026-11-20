import { WebGLRenderer } from '../gl/WebGLRenderer';
import { withEnumerableArrayPrototypeProperty } from '@test-utils';

describe('Renderer', () =>
{
    it('should emit resize event', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({ width: 1, height: 1 });
        const spy = jest.fn();

        renderer.on('resize', spy);
        renderer.resize(2, 4, 3);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(2, 4, 3);

        renderer.destroy();
    });

    it('should remove all event listeners when destroyed', async () =>
    {
        const renderer = new WebGLRenderer();

        renderer.on('resize', jest.fn());
        renderer.on('resize', jest.fn());
        expect(renderer.listenerCount('resize')).toBe(2);

        renderer.destroy();
        expect(renderer.listenerCount('resize')).toBe(0);
    });

    it('should init when Array.prototype has an enumerable property', async () =>
    {
        const renderer = new WebGLRenderer();

        await withEnumerableArrayPrototypeProperty(() => renderer.init({ width: 1, height: 1 }));

        expect(renderer.width).toBe(1);

        renderer.destroy();
    });
});

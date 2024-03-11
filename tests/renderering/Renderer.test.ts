import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

describe('Renderer', () =>
{
    it('should emit resize event', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({ width: 1, height: 1 });
        const spy = jest.fn();

        renderer.on('resize', spy);
        renderer.resize(2, 4);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(2, 4);

        renderer.destroy();
    });
});

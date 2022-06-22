import { SimpleRope } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Loader } from '@pixi/loaders';
import { Point } from '@pixi/math';
import { Renderer, Texture, BatchRenderer, extensions } from '@pixi/core';

skipHello();

describe('SimpleRope', () =>
{
    it('should create a rope from an external image', (done: () => void) =>
    {
        const loader = new Loader();

        loader.add('testBitmap', `file://${__dirname}/resources/bitmap-1.png`)
            .load((loader, resources) =>
            {
                const rope = new SimpleRope(resources.testBitmap.texture, [new Point(0, 0), new Point(0, 1)]);

                expect(rope).toBeInstanceOf(SimpleRope);
                expect(rope.autoUpdate).toBe(true);

                rope.destroy();
                resources.testBitmap.texture.destroy(true);

                loader.reset();

                done();
            });
    });

    it('should render the rope', () =>
    {
        extensions.add(BatchRenderer);

        const renderer = new Renderer();
        const rope = new SimpleRope(Texture.WHITE, [new Point(0, 0), new Point(0, 1)]);

        renderer.render(rope);

        rope.destroy();
        renderer.destroy();

        extensions.remove(BatchRenderer);
    });
});

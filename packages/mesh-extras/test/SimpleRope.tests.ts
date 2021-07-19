import { SimpleRope } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Loader } from '@pixi/loaders';
import { Point } from '@pixi/math';
import { Renderer, Texture, BatchRenderer } from '@pixi/core';
import { expect } from 'chai';

skipHello();

describe('SimpleRope', function ()
{
    it('should create a rope from an external image', function (done: () => void)
    {
        const loader = new Loader();

        loader.add('testBitmap', `file://${__dirname}/resources/bitmap-1.png`)
            .load(function (loader, resources)
            {
                const rope = new SimpleRope(resources.testBitmap.texture, [new Point(0, 0), new Point(0, 1)]);

                expect(rope).to.be.instanceof(SimpleRope);
                expect(rope.autoUpdate).to.be.true;

                rope.destroy();
                resources.testBitmap.texture.destroy(true);

                loader.reset();

                done();
            });
    });

    it('should render the rope', function ()
    {
        Renderer.registerPlugin('batch', BatchRenderer);

        const renderer = new Renderer();
        const rope = new SimpleRope(Texture.WHITE, [new Point(0, 0), new Point(0, 1)]);

        renderer.render(rope);

        rope.destroy();
        renderer.destroy();
    });
});

import { Cache, loadTextures } from '@pixi/assets';
import { Renderer, Texture } from '@pixi/core';
import { Point } from '@pixi/math';
import { SimpleRope } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Loader } from '../../assets/src/loader/Loader';

skipHello();

describe('SimpleRope', () =>
{
    let loader: Loader;
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/mesh-extras/test/resources/`
        : 'http://localhost:8080/mesh-extras/test/resources/';

    beforeEach(() =>
    {
        Cache.reset();
        loader.reset();
    });

    beforeAll(() =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadTextures);
    });
    it('should create a rope from an external image', async () =>
    {
        const texture = await loader.load(`${serverPath}bitmap-1.png`);
        const rope = new SimpleRope(texture, [new Point(0, 0), new Point(0, 1)]);

        expect(rope).toBeInstanceOf(SimpleRope);
        expect(rope.autoUpdate).toBe(true);

        rope.destroy();
        texture.destroy(true);
    });

    it('should render the rope', () =>
    {
        const renderer = new Renderer();
        const rope = new SimpleRope(Texture.WHITE, [new Point(0, 0), new Point(0, 1)]);

        renderer.render(rope);

        rope.destroy();
        renderer.destroy();
    });
});

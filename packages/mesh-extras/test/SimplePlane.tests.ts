import { Cache, loadTextures } from '@pixi/assets';
import { Point, Renderer, RenderTexture, Texture } from '@pixi/core';
import { SimplePlane } from '@pixi/mesh-extras';
import { Loader } from '../../assets/src/loader/Loader';

import type { PlaneGeometry } from '@pixi/mesh-extras';

describe('SimplePlane', () =>
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

    it('should create a plane from an external image', async () =>
    {
        const texture = await loader.load<Texture>(`${serverPath}bitmap-1.png`);

        const plane = new SimplePlane(texture, 100, 100);

        expect((plane.geometry as PlaneGeometry).segWidth).toEqual(100);
        expect((plane.geometry as PlaneGeometry).segHeight).toEqual(100);
    });

    it('should create a new empty textured SimplePlane', () =>
    {
        const plane = new SimplePlane(Texture.EMPTY, 100, 100);

        expect((plane.geometry as PlaneGeometry).segWidth).toEqual(100);
        expect((plane.geometry as PlaneGeometry).segHeight).toEqual(100);
    });

    describe('containsPoint', () =>
    {
        it('should return true when point inside', () =>
        {
            const point = new Point(10, 10);
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const plane = new SimplePlane(texture, 100, 100);

            expect(plane.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside', () =>
        {
            const point = new Point(100, 100);
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const plane = new SimplePlane(texture, 100, 100);

            expect(plane.containsPoint(point)).toBe(false);
        });
    });

    it('should render the plane', () =>
    {
        const renderer = new Renderer();
        const plane = new SimplePlane(Texture.WHITE, 100, 100);

        renderer.render(plane);

        plane.destroy();
        renderer.destroy();
    });
});

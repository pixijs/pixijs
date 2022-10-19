import { Texture, RenderTexture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { NineSlicePlane } from '@pixi/mesh-extras';
import '@pixi/canvas-display';

describe('NineSlicePlane', () =>
{
    let renderer: CanvasRenderer;

    beforeAll(() =>
    {
        renderer = new CanvasRenderer();
    });

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should be renderable with renderTexture in canvas', () =>
    {
        const rt = RenderTexture.create({ width: 10, height: 10 });
        const spr = new Sprite(Texture.WHITE);
        const renderer = new CanvasRenderer({ width: 12, height: 12 });

        renderer.render(spr, { renderTexture: rt });

        const nineSlicePlane = new NineSlicePlane(rt, 1, 1, 1, 1);

        expect(() => { renderer.render(nineSlicePlane); }).not.toThrowError();
    });
});

const { Texture, RenderTexture } = require('@pixi/core');
const { Sprite } = require('@pixi/sprite');
const { CanvasRenderer } = require('@pixi/canvas-renderer');
const { NineSlicePlane } = require('@pixi/mesh-extras');

describe('PIXI.NineSlicePlane', function ()
{
    before(function ()
    {
        this.renderer = new CanvasRenderer();
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('should be renderable with renderTexture in canvas', function ()
    {
        const rt = RenderTexture.create({ width: 10, height: 10 });
        const spr = new Sprite(Texture.WHITE);
        const renderer = new CanvasRenderer({ width: 12, height: 12 });

        renderer.render(spr, rt);

        const nineSlicePlane = new NineSlicePlane(rt, 1, 1, 1, 1);

        expect(() => { renderer.render(nineSlicePlane); }).to.not.throw();
    });
});

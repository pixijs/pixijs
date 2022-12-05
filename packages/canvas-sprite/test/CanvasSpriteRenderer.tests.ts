import { CanvasRenderer } from '@pixi/canvas-renderer';
import { BaseTexture, CanvasResource, MIPMAP_MODES, Rectangle, SCALE_MODES, Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import '@pixi/canvas-display';
import '@pixi/canvas-sprite';

describe('CanvasSpriteRenderer', () =>
{
    it('should still render a sprite after texture is destroyed', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });
        const texture = Texture.WHITE;
        const sprite = new Sprite(texture);

        renderer.render(sprite);
        texture.destroy();

        try
        {
            expect(() => { renderer.render(sprite); }).not.toThrowError();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should scale the base texture correctly using a trimmed rect', () =>
    {
        // create 2x1 texture, left pixel red, right pixel green
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = 2;
        canvas.height = 1;

        context.fillStyle = '#ff0000';
        context.fillRect(0, 0, 1, 1);

        context.fillStyle = '#00ff00';
        context.fillRect(1, 0, 1, 1);

        const baseTexture = new BaseTexture(new CanvasResource(canvas), {
            mipmap: MIPMAP_MODES.OFF,
            scaleMode: SCALE_MODES.NEAREST
        });

        // set a scale value to orig and trim rectangle to scale the texture
        const scale = 2;

        const frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);
        const orig = new Rectangle(0, 0, baseTexture.width * scale, baseTexture.height * scale);
        const trim = new Rectangle(0, 0, baseTexture.width * scale, baseTexture.height * scale);

        const testSprite = new Sprite(new Texture(baseTexture, frame, orig, trim));

        const stage = new Container();

        stage.addChild(testSprite);

        const renderer = new CanvasRenderer();

        renderer.render(stage);

        const ctx = renderer.view.getContext('2d');

        const pixels = ctx.getImageData(0, 0, 2 * scale, Number(scale)).data;

        expect(pixels[0]).toEqual(255);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);
        expect(pixels[3]).toEqual(255);

        expect(pixels[8]).toEqual(0);
        expect(pixels[9]).toEqual(255);
        expect(pixels[10]).toEqual(0);
        expect(pixels[11]).toEqual(255);
    });

    it('should render a sprite with a rotated base texture correctly', () =>
    {
        // create a 4x2 texture, left 2x2 red, right 2x2 green
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = 4;
        canvas.height = 2;

        context.fillStyle = '#ff0000';
        context.fillRect(0, 0, 2, 2);

        context.fillStyle = '#00ff00';
        context.fillRect(2, 0, 2, 2);

        const baseTexture = new BaseTexture(new CanvasResource(canvas), {
            mipmap: MIPMAP_MODES.OFF,
            scaleMode: SCALE_MODES.NEAREST
        });

        const frame = new Rectangle(0, 0, 4, 2);
        const orig = new Rectangle(0, 0, 2, 4);

        // create a sprite with a texture that treats this base texture as rotated
        // (now a 2x4 texture with the top 2x2 green, bottom 2x2 red)
        const testSprite = new Sprite(new Texture(baseTexture, frame, orig, null, 2));

        const stage = new Container();

        stage.addChild(testSprite);

        const renderer = new CanvasRenderer();

        renderer.render(stage);

        const ctx = renderer.view.getContext('2d');

        // grab 2x2 pixels from corner where the two 2x2s meet on the right edge,
        // so we can check nothing is rendering wider than it should
        const pixels = ctx.getImageData(1, 1, 2, 2).data;

        // the top left pixel should be green
        expect(pixels[0]).toEqual(0);
        expect(pixels[1]).toEqual(255);
        expect(pixels[2]).toEqual(0);
        expect(pixels[3]).toEqual(255);

        // the top right pixel should be black (not being rendered to)
        expect(pixels[4]).toEqual(0);
        expect(pixels[5]).toEqual(0);
        expect(pixels[6]).toEqual(0);
        expect(pixels[7]).toEqual(255);

        // the bottom left pixel should be red
        expect(pixels[8]).toEqual(255);
        expect(pixels[9]).toEqual(0);
        expect(pixels[10]).toEqual(0);
        expect(pixels[11]).toEqual(255);

        // the bottom right pixel should also black (not being rendered to)
        expect(pixels[12]).toEqual(0);
        expect(pixels[13]).toEqual(0);
        expect(pixels[14]).toEqual(0);
        expect(pixels[15]).toEqual(255);
    });
});

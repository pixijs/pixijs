import { BaseTexture, CanvasResource, Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { expect } from 'chai';
import { Container } from '@pixi/display';
import { MIPMAP_MODES, SCALE_MODES } from '@pixi/constants';
import { Rectangle } from '@pixi/math';

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
            expect(() => { renderer.render(sprite); }).to.not.throw();
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
        const orig  = new Rectangle(0, 0, baseTexture.width * scale, baseTexture.height * scale);
        const trim  = new Rectangle(0, 0, baseTexture.width * scale, baseTexture.height * scale);

        const testSprite = new Sprite(new Texture(baseTexture, frame, orig, trim));

        const stage = new Container();

        stage.addChild(testSprite);

        const renderer = new CanvasRenderer();

        renderer.render(stage);

        const ctx = renderer.view.getContext('2d');

        const pixels = ctx.getImageData(0, 0, 2 * scale, Number(scale)).data;

        expect(pixels[0]).to.equal(255);
        expect(pixels[1]).to.equal(0);
        expect(pixels[2]).to.equal(0);
        expect(pixels[3]).to.equal(255);

        expect(pixels[8]).to.equal(0);
        expect(pixels[9]).to.equal(255);
        expect(pixels[10]).to.equal(0);
        expect(pixels[11]).to.equal(255);
    });
});

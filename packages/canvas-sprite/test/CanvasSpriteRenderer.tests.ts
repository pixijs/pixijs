import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { expect } from 'chai';

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
});

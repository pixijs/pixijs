import { BatchRenderer, extensions, Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { expect } from 'chai';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';

describe('CanvasSpriteRenderer', () =>
{
    beforeAll(() => extensions.add(CanvasSpriteRenderer, BatchRenderer));
    afterAll(() => extensions.remove(CanvasSpriteRenderer, BatchRenderer));

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

import { BaseTexture, Texture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import '@pixi/canvas-display';

describe('CanvasGraphicsRenderer', () =>
{
    it('should not create pattern for White Texture', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics();

        graphics.beginTextureFill({ texture: Texture.WHITE });
        graphics.drawRect(0, 0, 1, 1);
        graphics.endFill();

        try
        {
            renderer.render(graphics);
            expect(Texture.WHITE.patternCache).toBeNull();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should create pattern for textures', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const canvas = document.createElement('canvas');
        const graphics = new Graphics();

        canvas.width = 16;
        canvas.height = 16;

        const myTex = new Texture(new BaseTexture(canvas));

        graphics.beginTextureFill({ texture: myTex });
        graphics.drawRect(0, 0, 1, 1);
        graphics.endFill();

        try
        {
            renderer.render(graphics);
            expect(Object.keys(myTex.patternCache).length).toEqual(1);
        }
        finally
        {
            myTex.destroy(true);
            renderer.destroy();
        }
    });
});

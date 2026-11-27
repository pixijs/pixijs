import '~/scene/graphics/init';
import { canvasUtils } from '../canvasUtils';
import { Rectangle } from '~/maths';
import { CanvasRenderer, ImageSource, Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

/**
 * A texture with a zero-size frame, such as the space glyph of a bitmap font.
 * @param width - Width of the frame.
 * @param height - Height of the frame.
 */
function makeEmptyFrameTexture(width = 0, height = 0): Texture
{
    const canvas = document.createElement('canvas');

    canvas.width = 4;
    canvas.height = 4;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 4, 4);

    return new Texture({
        source: new ImageSource({ resource: canvas }),
        frame: new Rectangle(1, 1, width, height),
    });
}

describe('canvasUtils', () =>
{
    describe('tinting a texture with an empty frame', () =>
    {
        it.each(['tintWithMultiply', 'tintWithOverlay', 'tintWithPerPixel'] as const)(
            '%s should produce a drawable canvas',
            (method) =>
            {
                const texture = makeEmptyFrameTexture(0, 2);
                const canvas = document.createElement('canvas');

                try
                {
                    canvasUtils[method](texture, 0x00ff00, canvas);

                    expect(canvas.width).toBeGreaterThan(0);
                    expect(canvas.height).toBeGreaterThan(0);

                    const target = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

                    expect(() => target.drawImage(canvas, 0, 0)).not.toThrow();
                    expect(Array.from(canvas.getContext('2d').getImageData(0, 0, 1, 1).data)).toEqual([0, 0, 0, 0]);
                }
                finally
                {
                    texture.destroy(true);
                }
            }
        );

        it('should render a tinted sprite without throwing', async () =>
        {
            const texture = makeEmptyFrameTexture();
            const renderer = new CanvasRenderer();

            await renderer.init({ width: 2, height: 2, backgroundAlpha: 0 });

            const sprite = new Sprite(texture);

            sprite.tint = 0x00ff00;

            try
            {
                expect(() => renderer.render({ container: sprite })).not.toThrow();
            }
            finally
            {
                renderer.destroy();
                sprite.destroy();
                texture.destroy(true);
            }
        });

        it('should render a tinted graphics texture without throwing', async () =>
        {
            const texture = makeEmptyFrameTexture();
            const renderer = new CanvasRenderer();

            await renderer.init({ width: 2, height: 2, backgroundAlpha: 0 });

            // BitmapText draws each glyph this way
            const graphics = new Graphics().texture(texture, 0x00ff00, 0, 0, 0, 0);

            try
            {
                expect(() => renderer.render({ container: graphics })).not.toThrow();
            }
            finally
            {
                renderer.destroy();
                graphics.destroy();
                texture.destroy(true);
            }
        });
    });
});

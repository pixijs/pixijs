import { FillGradient } from '../shared/fill/FillGradient';
import { Graphics } from '../shared/Graphics';
import '../init';
import { Rectangle } from '~/maths';
import { CanvasRenderer, ImageSource, Texture } from '~/rendering';

import type { GradientType } from '../shared/fill/FillGradient';

describe('Graphics Canvas rendering', () =>
{
    it.each<GradientType>(['linear', 'radial'])('should preserve translucent %s gradient colors', async (type) =>
    {
        const renderer = new CanvasRenderer();

        await renderer.init({ width: 4, height: 4, backgroundAlpha: 0 });

        // A constant-color region isolates tinting from interpolation and edge antialiasing.
        // The transparent final stop also avoids the radial gradient's background fill.
        const gradient = new FillGradient({
            type,
            colorStops: [
                { offset: 0, color: 'rgba(32, 64, 96, 0.5)' },
                { offset: 0.8, color: 'rgba(32, 64, 96, 0.5)' },
                { offset: 1, color: 'rgba(32, 64, 96, 0)' },
            ],
        });
        const graphics = new Graphics().rect(0, 0, 4, 4).fill(gradient);

        try
        {
            renderer.render({ container: graphics });

            const context = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;

            const pixel = context.getImageData(2, 2, 1, 1).data;
            const expectedRgb = [32, 64, 96];

            // Software Canvas gradient rasterization can vary by two RGB levels at half alpha.
            for (let channel = 0; channel < expectedRgb.length; channel++)
            {
                expect(Math.abs(pixel[channel] - expectedRgb[channel])).toBeLessThanOrEqual(2);
            }
            expect(pixel[3]).toBe(128);
        }
        finally
        {
            renderer.destroy();
            graphics.destroy();
            gradient.destroy();
        }
    });

    it('should preserve translucent texture fill colors', async () =>
    {
        const texCanvas = document.createElement('canvas');

        texCanvas.width = 3;
        texCanvas.height = 1;

        const texCtx = texCanvas.getContext('2d');
        const imageData = texCtx.createImageData(1, 1);

        imageData.data.set([32, 64, 96, 128]);
        texCtx.fillStyle = '#ff0000';
        texCtx.fillRect(0, 0, 3, 1);
        texCtx.putImageData(imageData, 1, 0);

        const texture = new Texture({
            source: new ImageSource({ resource: texCanvas }),
            frame: new Rectangle(1, 0, 1, 1),
        });
        const renderer = new CanvasRenderer();

        await renderer.init({ width: 2, height: 2, backgroundAlpha: 0 });

        const graphics = new Graphics().rect(0, 0, 2, 2).fill({ texture });

        try
        {
            renderer.render({ container: graphics });

            const context = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;

            expect(Array.from(context.getImageData(1, 1, 1, 1).data)).toEqual([32, 64, 96, 128]);
        }
        finally
        {
            renderer.destroy();
            graphics.destroy();
            texture.destroy(true);
        }
    });
});

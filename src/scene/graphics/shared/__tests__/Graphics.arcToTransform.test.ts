import { Graphics } from '../Graphics';
import { GraphicsPath } from '../path/GraphicsPath';
import { getApp } from '@test-utils';
import { Matrix, Rectangle } from '~/maths';

import type { Polygon } from '~/maths';

describe('Graphics.arcTo transforms', () =>
{
    it('should stretch the corner arc along with the rest of the path', async () =>
    {
        const app = await getApp({ preference: 'webgl' });
        const graphics = new Graphics();

        try
        {
            const frame = new Rectangle(0, 0, 180, 70);
            const canvas = document.createElement('canvas');

            canvas.width = frame.width;
            canvas.height = frame.height;

            const ctx = canvas.getContext('2d');

            ctx.moveTo(8, 8);
            ctx.setTransform(3, 0, 0, 1, 8, 8);
            ctx.arcTo(50, 0, 50, 50, 28);
            ctx.lineTo(50, 50);
            ctx.lineTo(0, 50);
            ctx.closePath();
            ctx.fillStyle = '#ff0000';
            ctx.fill();

            graphics
                .moveTo(8, 8)
                .setTransform(3, 0, 0, 1, 8, 8)
                .arcTo(50, 0, 50, 50, 28)
                .resetTransform()
                .lineTo(158, 58)
                .lineTo(8, 58)
                .closePath()
                .fill(0xff0000);

            const { pixels, width } = app.renderer.extract.pixels({ target: graphics, frame });
            const alphaAt = (x: number, y: number) => pixels[(((y * width) + x) * 4) + 3];

            // Sample well inside the fill and well outside the stretched corner.
            expect(ctx.getImageData(80, 20, 1, 1).data[3]).toBe(255);
            expect(ctx.getImageData(130, 12, 1, 1).data[3]).toBe(0);
            expect(alphaAt(80, 20)).toBe(255);
            expect(alphaAt(130, 12)).toBe(0);
        }
        finally
        {
            graphics.destroy();
            app.destroy(true, { children: true });
        }
    });

    it('should keep the current point when the arc transform cannot be inverted', () =>
    {
        const path = new GraphicsPath()
            .moveTo(8, 8)
            .arcTo(50, 0, 50, 50, 28, new Matrix(0, 0, 0, 1, 20, 0))
            .lineTo(8, 58);
        const { shape } = path.shapePath.shapePrimitives[0];

        expect((shape as Polygon).points).toEqual([8, 8, 8, 58]);
    });
});

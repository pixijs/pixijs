import { measureCanvasContent } from '@pixi/utils';

describe('measureCanvasContent', () =>
{
    it('should measure empty canvas', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 50;

        const measurement = measureCanvasContent(canvas);

        expect(measurement).toEqual({
            size: { width: 0, height: 0 },
            bounds: { top: 0, bottom: 0, left: 0, right: 0 }
        });
    });

    it('should measure non-empty canvas', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 50;

        const context = canvas.getContext('2d');

        context.fillStyle = '#ff0000';
        context.fillRect(10, 20, 10, 5);
        context.fillStyle = '#00ff00';
        context.fillRect(15, 25, 10, 5);

        const measurement = measureCanvasContent(canvas);

        expect(measurement).toEqual({
            size: { width: 15, height: 10 },
            bounds: { top: 20, bottom: 29, left: 10, right: 24 }
        });
    });
});

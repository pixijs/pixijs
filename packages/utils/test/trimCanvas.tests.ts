import { trimCanvas } from '@pixi/utils';

describe('trimCanvas', () =>
{
    it('should trim empty canvas', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 50;

        const trimmedImageData = trimCanvas(canvas);

        expect(trimmedImageData.width).toEqual(0);
        expect(trimmedImageData.height).toEqual(0);
        expect(trimmedImageData.data).toBe(null);
    });

    it('should trim the canvas', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 50;

        const context = canvas.getContext('2d');

        if (context === null) fail('Failed to get canvas 2D context');

        context.fillStyle = '#ff0000';
        context.fillRect(10, 20, 10, 5);
        context.fillStyle = '#00ff00';
        context.fillRect(15, 25, 10, 5);

        const trimmedImageData = trimCanvas(canvas);

        expect(trimmedImageData.width).toEqual(15);
        expect(trimmedImageData.height).toEqual(10);
        expect(trimmedImageData.data).toBeInstanceOf(ImageData);
        expect(trimmedImageData.data?.width).toEqual(15);
        expect(trimmedImageData.data?.height).toEqual(10);
        expect(trimmedImageData.data?.data).toEqual(context.getImageData(10, 20, 15, 10).data);
    });
});

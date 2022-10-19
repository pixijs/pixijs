import { trimCanvas } from '@pixi/utils';

describe('trimCanvas', () =>
{
    it('should trim the canvas', () =>
    {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = 100;
        canvas.height = 50;

        context.fillStyle = '#ff0000';
        context.fillRect(10, 20, 10, 5);

        const trimmedImageData = trimCanvas(canvas);

        expect(trimmedImageData.width).toEqual(9);
        expect(trimmedImageData.height).toEqual(5);
        expect(trimmedImageData.data).toBeInstanceOf(ImageData);
    });
});

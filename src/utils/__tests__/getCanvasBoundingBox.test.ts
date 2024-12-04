import { getCanvasBoundingBox } from '../canvas/getCanvasBoundingBox';

describe('getCanvasBoundingBox', () =>
{
    it('should get empty bounding box with empty canvas', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 50;

        const boundingBox = getCanvasBoundingBox(canvas);

        expect(boundingBox.left).toEqual(0);
        expect(boundingBox.top).toEqual(0);
        expect(boundingBox.right).toEqual(0);
        expect(boundingBox.bottom).toEqual(0);
        expect(boundingBox.width).toEqual(0);
        expect(boundingBox.height).toEqual(0);
        expect(boundingBox.isEmpty()).toEqual(true);
    });

    it('should get bounding box with non-empty canvas', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 50;

        const context = canvas.getContext('2d');

        if (context === null) throw Error('Failed to get canvas 2D context');

        context.fillStyle = '#ff0000';
        context.fillRect(10, 20, 10, 5);
        context.fillStyle = '#00ff00';
        context.fillRect(15, 25, 10, 5);

        const boundingBox = getCanvasBoundingBox(canvas);

        expect(boundingBox.left).toEqual(10);
        expect(boundingBox.top).toEqual(20);
        expect(boundingBox.right).toEqual(25);
        expect(boundingBox.bottom).toEqual(30);
        expect(boundingBox.width).toEqual(15);
        expect(boundingBox.height).toEqual(10);
        expect(boundingBox.isEmpty()).toEqual(false);
    });
});

import { trimCanvas } from '@pixi/utils';
import { expect } from 'chai';

describe('trimCanvas', function ()
{
    it('should trim the canvas', function ()
    {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = 100;
        canvas.height = 50;

        context.fillStyle = '#ff0000';
        context.fillRect(10, 20, 10, 5);

        const trimmedImageData = trimCanvas(canvas);

        expect(trimmedImageData.width).to.equal(9);
        expect(trimmedImageData.height).to.equal(5);
        expect(trimmedImageData.data).to.be.instanceOf(ImageData);
    });
});

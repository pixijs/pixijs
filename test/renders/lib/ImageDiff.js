'use strict';

/**
 * Compare images
 * @class ImageDiff
 */
class ImageDiff
{
    /**
     * @constructor
     * @param {int} width Width of the canvas
     * @param {int} height Height of the canvas
     * @param {Number} tolerance Tolerance for difference
     */
    constructor(width, height, tolerance)
    {
        this.width = width;
        this.height = height;
        this.tolerance = tolerance;

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;
        this.context = canvas.getContext('2d', {
            antialias: false,
            preserveDrawingBuffer: true,
        });
    }

    /**
     * Compare two base64 images
     * @method compare
     * @param {string} src1 Canvas source
     * @param {string} src2 Canvas source
     * @return {Boolean} If images are within tolerance
     */
    compare(src1, src2)
    {
        const a = this.getImageData(src1);
        const b = this.getImageData(src2);
        const len = a.length;
        const tolerance = this.tolerance;

        const diff = a.filter(function (val, i)
        {
            return Math.abs(val - b[i]) / 255 > tolerance;
        });

        if (diff.length / len > tolerance)
        {
            return false;
        }

        return true;
    }

    /**
     * Get an array of pixels
     * @method getImageData
     * @param {string} src Source of the image
     * @return {Uint8ClampedArray} Data for image of pixels
     */
    getImageData(src)
    {
        const image = new Image();

        image.src = src;
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.drawImage(image, 0, 0, this.width, this.height);
        const imageData = this.context.getImageData(0, 0, this.width, this.height);

        return imageData.data;
    }
}

module.exports = ImageDiff;

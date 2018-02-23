import * as core from '../core';

/**
 * Contains extracted data
 * @class
 * @memberof PIXI.extract
 */
export default class CanvasData
{

    /**
     * Create extracted data
     * @param {Uint8Array} pixels data
     * @param {PIXI.Rectangle} frame frame that it was taken from
     * @param {number} [resolution=1] renderer resolution
     * @param {boolean} [premultiplyAlpha=false] whether the data is premultiplied
     * @param {boolean} [flipY=false] whether the data is flipped
     */
    constructor(pixels, frame, resolution = 1, premultiplyAlpha = false, flipY = false)
    {
        /**
         * @member {Uint8Array} pixels data
         */
        this.pixels = pixels;

        /**
         * @member {PIXI.Rectangle} the frame it was taken from
         */
        this.frame = new core.Rectangle().copy(frame);

        /**
         * @member {number} the resolution of the renderer
         */
        this.resolution = resolution;

        /**
         * @member {boolean} the data is premultiplied
         */
        this.premultiplyAlpha = premultiplyAlpha;

        /**
         * @member {boolean} the data is flipped by Y
         */
        this.flipY = flipY;
    }

    /**
     * width in real pixels
     * @member {number}
     * @readonly
     */
    get width()
    {
        return this.frame.width * this.resolution;
    }

    /**
     * height in real pixels
     * @member {number}
     * @readonly
     */
    get height()
    {
        return this.frame.height * this.resolution;
    }

    /**
     * Normalize the data to store it in base64 format or in canvas
     *
     * @param {boolean} [premultiplyAlpha=false] if false, should remove premultiplied alpha
     * @param {boolean} [flipY=true] if true, should flip Y
     * @returns {PIXI.extract.CanvasData} this.
     */
    normalize(premultiplyAlpha = false, flipY = false)
    {
        if (this.flipY !== flipY)
        {
            this.flipY = flipY;
            CanvasData.arrayFlipY(this.pixels, this.width);
        }

        if (this.premultiplyAlpha && !premultiplyAlpha)
        {
            this.premultiplyAlpha = false;
            CanvasData.arrayPostDivide(this.pixels);
        }

        return this;
    }

    /**
     * Creates a Canvas element from this data
     * @returns {HTMLCanvasElement} a canvas
     */
    canvas()
    {
        const { pixels, width, height } = this;

        const canvasBuffer = new core.CanvasRenderTarget(width, height);

        const canvasData = canvasBuffer.context.getImageData(0, 0, width, height);

        canvasData.data.set(pixels);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        return canvasBuffer.canvas;
    }

    /**
     * Creates base64 string from this data
     * @returns {string} base64 string
     */
    base64()
    {
        return this.canvas().toDataURL();
    }

    /**
     * Neutralizes pre-multiplied alpha in pixels array
     * @param {Uint8Array} pixels input
     */
    static arrayPostDivide(pixels)
    {
        for (let i = 0; i < pixels.length; i += 4)
        {
            const alpha = pixels[i + 3];

            if (alpha)
            {
                pixels[i] = Math.round(Math.min(pixels[i] * 255.0 / alpha, 255.0));
                pixels[i + 1] = Math.round(Math.min(pixels[i + 1] * 255.0 / alpha, 255.0));
                pixels[i + 2] = Math.round(Math.min(pixels[i + 2] * 255.0 / alpha, 255.0));
            }
        }
    }

    /**
     * Flips Y in pixels array
     * @param {Uint8Array} pixels input
     * @param {number} width number of pixels in a row
     */
    static arrayFlipY(pixels, width)
    {
        const w4 = width * 4;

        for (let pos = 0; pos * 2 < pixels.length; pos += w4)
        {
            let pos1 = pos;
            let pos2 = pixels.length - pos - w4;
            let t = 0;

            for (let x = 0; x < w4; x++)
            {
                t = pixels[pos1];
                pixels[pos1] = pixels[pos2];
                pixels[pos2] = t;

                pos1++;
                pos2++;
            }
        }
    }

    /**
     * takes data from canvas, 2d
     * @param {HTMLCanvasElement} canvas the source
     * @param {PIXI.Rectangle} [region] the region
     * @returns {ExtractData} result
     */
    static fromCanvas(canvas, region)
    {
        region = region || new core.Rectangle(0, 0, canvas.width, canvas.height);

        const ext = canvas.getContext('2d').getImageData(region.x, region.y, region.width, region.height);

        return new CanvasData(ext.data, region);
    }

    /**
     * takes data from image element
     * @param {HTMLImageElement} img the source
     * @param {PIXI.Rectangle} [region] the region
     * @returns {ExtractData} result
     */
    static fromImage(img, region)
    {
        region = region || new core.Rectangle(0, 0, img.width, img.height);

        const canvas = document.createElement('canvas');

        canvas.width = region.width;
        canvas.height = region.height;

        canvas.getContext('2d').drawImage(img, region.x, region.y, region.width, region.height,
            0, 0, region.width, region.height);

        const result = CanvasData.fromCanvas(canvas);

        result.frame.x = region.x;
        result.frame.y = region.y;

        return result;
    }
}

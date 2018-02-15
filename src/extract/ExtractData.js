import * as core from '../core';

/**
 * Contains extracted data
 */
export default class ExtractData
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
     * @returns {ExtractData} this.
     */
    normalize(premultiplyAlpha = false, flipY = false)
    {
        if (this.flipY !== flipY)
        {
            this.flipY = true;
            ExtractData.arrayFlipY(this.pixels, this.width);
        }

        if (this.premultiplyAlpha && !premultiplyAlpha)
        {
            this.premultiplyAlpha = false;
            ExtractData.arrayPostDivide(this.pixels);
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
                pixels[i] = Math.round(pixels[i] * 255.0 / alpha);
                pixels[i + 1] = Math.round(pixels[i + 1] * 255.0 / alpha);
                pixels[i + 2] = Math.round(pixels[i + 2] * 255.0 / alpha);
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
                pos1++;
                pos2++;

                t = pixels[pos1];
                pixels[pos1] = pixels[pos2];
                pixels[pos2] = t;
            }
        }
    }
}

import type { ICanvas } from '@pixi/settings';

function checkRow(data: Uint8ClampedArray, width: number, y: number)
{
    for (let x = 0, index = 4 * y * width; x < width; ++x, index += 4)
    {
        if (data[index + 3] !== 0) return false;
    }

    return true;
}

function checkColumn(data: Uint8ClampedArray, width: number, x: number, top: number, bottom: number)
{
    const stride = 4 * width;

    for (let y = top, index = (top * stride) + (4 * x); y <= bottom; ++y, index += stride)
    {
        if (data[index + 3] !== 0) return false;
    }

    return true;
}

/**
 * Trim transparent borders from a canvas
 * @memberof PIXI.utils
 * @function trimCanvas
 * @param {PIXI.ICanvas} canvas - the canvas to trim
 * @returns {object} Trim data
 */
export function trimCanvas(canvas: ICanvas): {width: number, height: number, data?: ImageData | null }
{
    // https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf

    let { width, height } = canvas;

    const context = canvas.getContext('2d', {
        willReadFrequently: true,
    });

    if (context !== null)
    {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        let top = 0;
        let bottom = height - 1;
        let left = 0;
        let right = width - 1;

        while (top < height && checkRow(data, width, top)) ++top;
        if (top === height)
        {
            return { width: 0, height: 0, data: null };
        }
        while (checkRow(data, width, bottom)) --bottom;
        while (checkColumn(data, width, left, top, bottom)) ++left;
        while (checkColumn(data, width, right, top, bottom)) --right;

        width = right - left + 1;
        height = bottom - top + 1;

        return {
            width, height,
            data: context.getImageData(left, top, width, height),
        };
    }
    throw new TypeError('Canvas rendering context is null');
}

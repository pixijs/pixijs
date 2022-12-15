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
 * Measure canvas content (size/bounds of non-transparent pixels)
 * @memberof PIXI.utils
 * @function measureCanvasContent
 * @param {PIXI.ICanvas} canvas - the canvas to measure
 * @returns {object} Canvas measurement
 */
export function measureCanvasContent(canvas: ICanvas):
{
        size: {
            width: number;
            height: number;
        }
        bounds: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        }
    }
{
    // https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf

    let { width, height } = canvas;

    const context = canvas.getContext('2d', {
        willReadFrequently: true,
    });
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    let top = 0;
    let bottom = height - 1;
    let left = 0;
    let right = width - 1;

    while (top < height && checkRow(data, width, top)) ++top;
    if (top === height)
    {
        return {
            size: { width: 0, height: 0 },
            bounds: { top: 0, right: 0, bottom: 0, left: 0 }
        };
    }
    while (checkRow(data, width, bottom)) --bottom;
    while (checkColumn(data, width, left, top, bottom)) ++left;
    while (checkColumn(data, width, right, top, bottom)) --right;

    width = right - left + 1;
    height = bottom - top + 1;

    return {
        size: { width, height },
        bounds: { top, bottom, left, right }
    };
}

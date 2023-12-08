import { Rectangle } from '../../maths/shapes/Rectangle';

import type { ICanvas } from '../../environment/canvas/ICanvas';

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
 * Measuring the bounds of a canvas' visible (non-transparent) pixels.
 * @param canvas - The canvas to measure.
 * @param resolution - The resolution of the canvas.
 * @returns The bounding box of the canvas' visible pixels.
 * @since 7.1.0
 * @memberof utils
 */
export function getCanvasBoundingBox(canvas: ICanvas, resolution = 1): Rectangle
{
    // https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf

    const { width, height } = canvas;

    const context = canvas.getContext('2d', {
        willReadFrequently: true,
    });

    if (context === null)
    {
        throw new TypeError('Failed to get canvas 2D context');
    }

    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    let left = 0;
    let top = 0;
    let right = width - 1;
    let bottom = height - 1;

    while (top < height && checkRow(data, width, top)) ++top;
    if (top === height) return Rectangle.EMPTY;
    while (checkRow(data, width, bottom)) --bottom;
    while (checkColumn(data, width, left, top, bottom)) ++left;
    while (checkColumn(data, width, right, top, bottom)) --right;

    ++right;
    ++bottom;

    return new Rectangle(left / resolution, top / resolution, (right - left) / resolution, (bottom - top) / resolution);
}

import { BoundingBox } from './BoundingBox';

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
 * Measuring the bounds of a canvas' visible (non-transparent) pixels.
 * @memberof PIXI.utils
 * @param {PIXI.ICanvas} canvas - The canvas to measure.
 * @returns {PIXI.utils.BoundingBox} The bounding box of the canvas' visible pixels.
 * @since 7.1.0
 */
export function getCanvasBoundingBox(canvas: ICanvas): BoundingBox
{
    // https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf

    const { width, height } = canvas;

    const context = canvas.getContext('2d', {
        willReadFrequently: true,
    });
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    let left = 0;
    let top = 0;
    let right = width - 1;
    let bottom = height - 1;

    while (top < height && checkRow(data, width, top)) ++top;
    if (top === height) return BoundingBox.EMPTY;
    while (checkRow(data, width, bottom)) --bottom;
    while (checkColumn(data, width, left, top, bottom)) ++left;
    while (checkColumn(data, width, right, top, bottom)) --right;

    ++right;
    ++bottom;

    return new BoundingBox(left, top, right, bottom);
}

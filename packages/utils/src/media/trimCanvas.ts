import { getCanvasBoundingBox } from './getCanvasBoundingBox';

import type { ICanvas } from '@pixi/settings';

/**
 * Trim transparent borders from a canvas.
 * @memberof PIXI.utils
 * @param {PIXI.ICanvas} canvas - The canvas to trim.
 * @returns The trimmed canvas data.
 */
export function trimCanvas(canvas: ICanvas): { width: number, height: number, data: ImageData | null }
{
    const boundingBox = getCanvasBoundingBox(canvas);
    const { width, height } = boundingBox;
    let data = null;

    if (!boundingBox.isEmpty())
    {
        const context = canvas.getContext('2d');

        if (context === null)
        {
            throw new TypeError('Failed to get canvas 2D context');
        }

        data = context.getImageData(
            boundingBox.left,
            boundingBox.top,
            width,
            height
        );
    }

    return { width, height, data };
}

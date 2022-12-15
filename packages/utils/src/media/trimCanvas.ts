import { measureCanvasContent } from '@pixi/utils';

import type { ICanvas } from '@pixi/settings';

/**
 * Trim transparent borders from a canvas
 * @memberof PIXI.utils
 * @function trimCanvas
 * @param {PIXI.ICanvas} canvas - the canvas to trim
 * @returns {object} Trim data
 */
export function trimCanvas(canvas: ICanvas): { width: number; height: number; data?: ImageData }
{
    const { size, bounds } = measureCanvasContent(canvas);
    let data = null;

    if (size.height > 0)
    {
        const context = canvas.getContext('2d');

        data = context.getImageData(
            bounds.left,
            bounds.top,
            size.width,
            size.height
        );
    }

    return { ...size, data };
}

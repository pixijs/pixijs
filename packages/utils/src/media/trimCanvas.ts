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
    const content = measureCanvasContent(canvas);
    let data = null;

    if (content.height > 0)
    {
        const context = canvas.getContext('2d');

        data = context.getImageData(
            content.left,
            content.top,
            content.width,
            content.height
        );
    }

    return {
        width: content.width,
        height: content.height,
        data
    };
}

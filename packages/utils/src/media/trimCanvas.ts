import type { ICanvas } from '@pixi/settings';

interface Inset
{
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}

/**
 * Trim transparent borders from a canvas
 * @memberof PIXI.utils
 * @function trimCanvas
 * @param {PIXI.ICanvas} canvas - the canvas to trim
 * @returns {object} Trim data
 */
export function trimCanvas(canvas: ICanvas): {width: number; height: number; data?: ImageData}
{
    // https://gist.github.com/remy/784508

    let width = canvas.width;
    let height = canvas.height;

    const context = canvas.getContext('2d', {
        willReadFrequently: true,
    });
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const len = pixels.length;

    const bound: Inset = {
        top: null,
        left: null,
        right: null,
        bottom: null,
    };
    let data = null;
    let i;
    let x;
    let y;

    for (i = 0; i < len; i += 4)
    {
        if (pixels[i + 3] !== 0)
        {
            x = (i / 4) % width;
            y = ~~((i / 4) / width);

            if (bound.top === null)
            {
                bound.top = y;
            }

            if (bound.left === null)
            {
                bound.left = x;
            }
            else if (x < bound.left)
            {
                bound.left = x;
            }

            if (bound.right === null)
            {
                bound.right = x + 1;
            }
            else if (bound.right < x)
            {
                bound.right = x + 1;
            }

            if (bound.bottom === null)
            {
                bound.bottom = y;
            }
            else if (bound.bottom < y)
            {
                bound.bottom = y;
            }
        }
    }

    if (bound.top !== null)
    {
        width = bound.right - bound.left;
        height = bound.bottom - bound.top + 1;
        data = context.getImageData(bound.left, bound.top, width, height);
    }

    return {
        height,
        width,
        data,
    };
}

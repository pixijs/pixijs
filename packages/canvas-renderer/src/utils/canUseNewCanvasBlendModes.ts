import { settings } from '@pixi/settings';

import type { ICanvas } from '@pixi/core';

/**
 * Creates a little colored canvas
 * @ignore
 * @param {string} color - The color to make the canvas
 * @returns {ICanvas} a small canvas element
 */
function createColoredCanvas(color: string): ICanvas
{
    const canvas = settings.ADAPTER.createCanvas(6, 1);
    const context = canvas.getContext('2d');

    context.fillStyle = color;
    context.fillRect(0, 0, 6, 1);

    return canvas;
}

/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 * @private
 * @returns {boolean} whether they are supported
 */
export function canUseNewCanvasBlendModes(): boolean
{
    if (typeof document === 'undefined')
    {
        return false;
    }

    const magenta = createColoredCanvas('#ff00ff');
    const yellow = createColoredCanvas('#ffff00');

    const canvas = settings.ADAPTER.createCanvas(6, 1);
    const context = canvas.getContext('2d');

    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta as CanvasImageSource, 0, 0);
    context.drawImage(yellow as CanvasImageSource, 2, 0);

    const imageData = context.getImageData(2, 0, 1, 1);

    if (!imageData)
    {
        return false;
    }

    const data = imageData.data;

    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
}

import { settings } from '@pixi/core';

import type { ICanvas } from '@pixi/core';

let canUseNewCanvasBlendModesValue: boolean | undefined;

/**
 * Creates a little colored canvas
 * @ignore
 * @param {string} color - The color to make the canvas
 * @returns {PIXI.ICanvas} a small canvas element
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

    if (canUseNewCanvasBlendModesValue !== undefined)
    {
        return canUseNewCanvasBlendModesValue;
    }

    const magenta = createColoredCanvas('#ff00ff');
    const yellow = createColoredCanvas('#ffff00');

    const canvas = settings.ADAPTER.createCanvas(6, 1);
    const context = canvas.getContext('2d');

    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);

    const imageData = context.getImageData(2, 0, 1, 1);

    if (!imageData)
    {
        canUseNewCanvasBlendModesValue = false;
    }
    else
    {
        const data = imageData.data;

        canUseNewCanvasBlendModesValue = (data[0] === 255 && data[1] === 0 && data[2] === 0);
    }

    return canUseNewCanvasBlendModesValue;
}

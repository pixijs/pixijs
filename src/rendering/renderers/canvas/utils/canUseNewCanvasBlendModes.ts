import { DOMAdapter } from '../../../../environment/adapter';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';

let canUseNewCanvasBlendModesValue: boolean | undefined;

function createColoredCanvas(color: string): ICanvas
{
    const canvas = DOMAdapter.get().createCanvas(6, 1);
    const context = canvas.getContext('2d');

    context.fillStyle = color;
    context.fillRect(0, 0, 6, 1);

    return canvas;
}

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

    const canvas = DOMAdapter.get().createCanvas(6, 1);
    const context = canvas.getContext('2d');

    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta as unknown as CanvasImageSource, 0, 0);
    context.drawImage(yellow as unknown as CanvasImageSource, 2, 0);

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

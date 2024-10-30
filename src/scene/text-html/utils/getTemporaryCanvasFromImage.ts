import { CanvasPool } from '../../../rendering/renderers/shared/texture/CanvasPool';

import type { CanvasAndContext } from '../../../rendering/renderers/shared/texture/CanvasPool';

/**
 * This function converts an image to a canvas, and returns the canvas.
 * It is used to convert images to canvases to work around a CORS issue where WebGPU cannot
 * upload an SVGImage to a texture.
 *
 * It uses the CanvasPool to get an optimal canvas and context, and then draws the image onto it.
 * Remember to return this canvas is immediately to the CanvasPool for reuse when you are done with it.
 * (eg upload it to the GPU!)
 * @param image - The image to convert to a canvas.
 * @param resolution - The resolution of the canvas.
 */
export function getTemporaryCanvasFromImage(image: HTMLImageElement, resolution: number): CanvasAndContext
{
    // Get an optimal canvas and context from the CanvasPool, based on the
    // dimensions of the image and the desired resolution.
    const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(
        image.width,
        image.height,
        resolution
    );

    // Clear the context of the canvas, and draw the image onto it.
    const { context } = canvasAndContext;

    context.clearRect(0, 0, image.width, image.height);
    context.drawImage(image, 0, 0);

    // Return the canvas.
    return canvasAndContext;
}


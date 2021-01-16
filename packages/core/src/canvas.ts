export type Canvas = HTMLCanvasElement | OffscreenCanvas;

/**
 * Assigns the width property to given target canvas from given srcCanvas.
 *
 * @param {Canvas} canvas - The target Canvas instance
 * @param {Canvas} srcCanvas - The source Canvas instance
 * @return {Canvas} The given target canvas
 */
export function setWidth(canvas: Canvas, srcCanvas: Canvas): Canvas
{
    if (!canvas) return canvas;
    if (!srcCanvas) return canvas;

    canvas.width = srcCanvas.width;

    return canvas;
}

/**
 * Assigns the height property to given target canvas from given srcCanvas.
 *
 * @param {Canvas} canvas - The target Canvas instance
 * @param {Canvas} srcCanvas - The source Canvas instance
 * @return {Canvas} The given target canvas
 */
export function setHeight(canvas: Canvas, srcCanvas: Canvas): Canvas
{
    if (!canvas) return canvas;
    if (!srcCanvas) return canvas;

    canvas.height = srcCanvas.height;

    return canvas;
}

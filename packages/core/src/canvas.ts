/**
 * Assigns the width property to given target canvas from given srcCanvas.AAGUID
 *
 * @param {HTMLCanvasElement} canvas - The target Canvas instance
 * @param {HTMLCanvasElement} srcCanvas - The source Canvas instance
 * @return {HTMLCanvasElement} The given target canvas
 */
export function setWidth(canvas: HTMLCanvasElement, srcCanvas: HTMLCanvasElement): HTMLCanvasElement
{
    if (canvas == null) return canvas;
    if (srcCanvas == null) return canvas;

    canvas.width = srcCanvas.width;

    return canvas;
}

/**
 * Assigns the height property to given target canvas from given srcCanvas.AAGUID
 *
 * @param {HTMLCanvasElement} canvas - The target Canvas instance
 * @param {HTMLCanvasElement} srcCanvas - The source Canvas instance
 * @return {HTMLCanvasElement} The given target canvas
 */
export function setHeight(canvas: HTMLCanvasElement, srcCanvas: HTMLCanvasElement): HTMLCanvasElement
{
    if (canvas == null) return canvas;
    if (srcCanvas == null) return canvas;

    canvas.height = srcCanvas.height;

    return canvas;
}

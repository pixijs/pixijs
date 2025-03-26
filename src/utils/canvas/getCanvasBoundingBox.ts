import { DOMAdapter } from '../../environment/adapter';
import { nextPow2 } from '../../maths/misc/pow2';
import { Rectangle } from '../../maths/shapes/Rectangle';

import type { ICanvas } from '../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../environment/canvas/ICanvasRenderingContext2D';

// Internal canvas for measuring bounds
let _internalCanvas: ICanvas | null = null;
let _internalContext: ICanvasRenderingContext2D | null = null;

function ensureInternalCanvas(width: number, height: number): void
{
    if (!_internalCanvas)
    {
        _internalCanvas = DOMAdapter.get().createCanvas(256, 128);
        _internalContext = _internalCanvas.getContext('2d', { willReadFrequently: true });
        _internalContext.globalCompositeOperation = 'copy';
        _internalContext.globalAlpha = 1;
    }

    if (_internalCanvas.width < width || _internalCanvas.height < height)
    {
        // Use power-of-two dimensions for better performance
        _internalCanvas.width = nextPow2(width);
        _internalCanvas.height = nextPow2(height);
    }
}

function checkRow(data: Uint8ClampedArray, width: number, y: number)
{
    for (let x = 0, index = 4 * y * width; x < width; ++x, index += 4)
    {
        if (data[index + 3] !== 0) return false;
    }

    return true;
}

function checkColumn(data: Uint8ClampedArray, width: number, x: number, top: number, bottom: number)
{
    const stride = 4 * width;

    for (let y = top, index = (top * stride) + (4 * x); y <= bottom; ++y, index += stride)
    {
        if (data[index + 3] !== 0) return false;
    }

    return true;
}

/**
 * Measures the bounding box of a canvas's visible (non-transparent) pixels.
 *
 * This function analyzes the alpha channel of the canvas pixels to find the smallest
 * rectangle containing all non-transparent pixels. It's useful for optimizing sprite
 * rendering by trimming transparent borders.
 *
 * Uses an internal canvas with `willReadFrequently: true` for efficient pixel data access.
 * This internal canvas is reused between calls for better performance.
 * @example
 * ```typescript
 * // Basic usage - get trim bounds at full resolution
 * const bounds = getCanvasBoundingBox(myCanvas);
 * console.log(bounds); // Rectangle{x: 10, y: 5, width: 100, height: 200}
 * // Optimized for performance with lower resolution scanning
 * const fastBounds = getCanvasBoundingBox(largeCanvas, canvas.width, canvas.height, 0.5);
 * // Resolution of 0.5 means scanning at half size, much faster for large canvases
 *
 * // Using custom dimensions - only analyze part of the canvas
 * const partialBounds = getCanvasBoundingBox(myCanvas, 100, 100);
 * // Only analyzes a 100x100 region starting from top-left
 * ```
 * @param canvas - The canvas to measure
 * @param width - Optional. The width to analyze (defaults to canvas.width)
 * @param height - Optional. The height to analyze (defaults to canvas.height)
 * @param resolution - Optional. The resolution at which to analyze the canvas, between 0-1.
 *                    Lower values improve performance for large canvases but may be less precise.
 *                    Default is 1 (full resolution).
 * @param output - Optional. The rectangle to store the result in.
 * @returns The bounding box as a Rectangle containing the visible content.
 *          Returns Rectangle.EMPTY if the canvas is completely transparent.
 * @since 7.1.0
 * @memberof utils
 */
export function getCanvasBoundingBox(
    canvas: ICanvas,
    width: number = canvas.width,
    height: number = canvas.height,
    resolution = 1,
    output?: Rectangle
): Rectangle
{
    // Cap resolution at 1
    resolution = Math.min(resolution, 1);

    // Ensure internal canvas is large enough
    ensureInternalCanvas(width, height);

    if (!_internalContext)
    {
        throw new TypeError('Failed to get canvas 2D context');
    }

    // Set up for pixel replacement (no blending)
    _internalContext.drawImage(
        canvas as unknown as CanvasImageSource,
        0, 0,
        width, height,
        0, 0,
        width * resolution, height * resolution
    );

    // Get the image data at full resolution
    const imageData = _internalContext.getImageData(0, 0, width, height);
    const data = imageData.data;

    let left = 0;
    let top = 0;
    let right = width - 1;
    let bottom = height - 1;

    while (top < height && checkRow(data, width, top)) ++top;
    if (top === height) return Rectangle.EMPTY;
    while (checkRow(data, width, bottom)) --bottom;
    while (checkColumn(data, width, left, top, bottom)) ++left;
    while (checkColumn(data, width, right, top, bottom)) --right;

    ++right;
    ++bottom;

    _internalContext.globalCompositeOperation = 'source-over';
    // draw the rect on the canvas
    _internalContext.strokeRect(left, top, right - left, bottom - top);
    _internalContext.globalCompositeOperation = 'copy';

    output ??= new Rectangle();

    output.set(left / resolution, top / resolution, (right - left) / resolution, (bottom - top) / resolution);

    return output;
}

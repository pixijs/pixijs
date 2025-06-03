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

/** @internal */
export interface GetCanvasBoundingBoxOptions
{
    /** The canvas to measure */
    canvas: ICanvas;
    /** Optional. The width to analyze (defaults to canvas.width) */
    width?: number;
    /** Optional. The height to analyze (defaults to canvas.height) */
    height?: number;
    /**
     * Optional. The resolution at which to analyze the canvas, between 0-1.
     * Lower values improve performance for large canvases but may be less precise.
     * Default is 1 (full resolution).
     */
    resolution?: number;
    /** Optional. The rectangle to store the result in. */
    output?: Rectangle;
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
 * const bounds = getCanvasBoundingBox({ canvas: myCanvas });
 * console.log(bounds); // Rectangle{x: 10, y: 5, width: 100, height: 200}
 * // Optimized for performance with lower resolution scanning
 * const fastBounds = getCanvasBoundingBox({
 *     canvas: largeCanvas,
 *     width: largeCanvas.width,
 *     height: largeCanvas.height,
 *     resolution: 0.5
 * });
 * // Resolution of 0.5 means scanning at half size, much faster for large canvases
 *
 * // Using custom dimensions - only analyze part of the canvas
 * const partialBounds = getCanvasBoundingBox({ canvas: myCanvas, width: 100, height: 100 });
 * // Only analyzes a 100x100 region starting from top-left
 * ```
 * @param options - The options for measuring the bounding box, including the canvas to measure.
 * @returns The bounding box as a Rectangle containing the visible content.
 *          Returns Rectangle.EMPTY if the canvas is completely transparent.
 * @internal
 */
export function getCanvasBoundingBox(
    options: GetCanvasBoundingBoxOptions,
): Rectangle;
/**
 * @param canvas
 * @param resolution
 * @internal
 * @deprecated since 8.10.0
 */
export function getCanvasBoundingBox(canvas: ICanvas, resolution?: number): Rectangle;
/**
 * @param {...any} args
 * @internal
 */
export function getCanvasBoundingBox(...args: [GetCanvasBoundingBoxOptions] | [ICanvas, number?]): Rectangle
{
    let options = args[0] as GetCanvasBoundingBoxOptions;

    if (!options.canvas)
    {
        options = { canvas: args[0] as ICanvas, resolution: args[1] };
    }

    const { canvas } = options; // canvas is correctly extracted from options

    // Cap resolution at 1
    const resolution = Math.min(options.resolution ?? 1, 1);
    const width = options.width ?? canvas.width;
    const height = options.height ?? canvas.height;
    let output = options.output;

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


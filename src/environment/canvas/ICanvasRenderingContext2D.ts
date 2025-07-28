import { type IImage } from '../IImage';

import type { ICanvas } from './ICanvas';

/**
 * Common interface for CanvasRenderingContext2D, OffscreenCanvasRenderingContext2D, and other custom canvas 2D context.
 * @category environment
 * @advanced
 */
export interface ICanvasRenderingContext2D extends
    CanvasState,
    CanvasTransform,
    CanvasCompositing,
    CanvasImageSmoothing,
    CanvasFillStrokeStyles,
    CanvasShadowStyles,
    CanvasFilters,
    CanvasRect,
    CanvasDrawPath,
    CanvasText,
    CanvasDrawImage,
    CanvasImageData,
    CanvasPathDrawingStyles,
    Omit<CanvasTextDrawingStyles, 'letterSpacing'>,
    CanvasPath
{
    /** creates a pattern using the specified image and repetition. */
    createPattern(image: CanvasImageSource | ICanvas | IImage, repetition: string | null): CanvasPattern | null;

    /** provides different ways to draw an image onto the canvas */
    drawImage(image: CanvasImageSource | ICanvas | IImage, dx: number, dy: number): void;
    drawImage(image: CanvasImageSource | ICanvas | IImage, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: CanvasImageSource | ICanvas | IImage, sx: number, sy: number, sw: number, sh: number,
        dx: number, dy: number, dw: number, dh: number): void;

    /** sets the horizontal spacing behavior between text characters. */
    letterSpacing?: string;
    /** sets the horizontal spacing behavior between text characters. */
    textLetterSpacing?: string; // For Chrome < 94
}

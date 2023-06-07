import type { ICanvas } from './ICanvas';

/**
 * Common interface for CanvasRenderingContext2D, OffscreenCanvasRenderingContext2D, and other custom canvas 2D context.
 * @memberof PIXI
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
    CanvasTextDrawingStyles,
    CanvasPath
{
    createPattern(image: CanvasImageSource | ICanvas, repetition: string | null): CanvasPattern | null;

    drawImage(image: CanvasImageSource | ICanvas, dx: number, dy: number): void;
    drawImage(image: CanvasImageSource | ICanvas, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: CanvasImageSource | ICanvas, sx: number, sy: number, sw: number, sh: number,
        dx: number, dy: number, dw: number, dh: number): void;

    letterSpacing?: string;
    textLetterSpacing?: string; // For Chrome < 94
}

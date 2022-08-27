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
{}

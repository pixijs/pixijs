import type { ICanvasRenderingContext2D } from './ICanvasRenderingContext2D';

export type ContextIds = '2d' | 'bitmaprenderer' | 'webgl' | 'experimental-webgl' | 'webgl2' | 'experimental-webgl2';

type RenderingContext =
    ICanvasRenderingContext2D | ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext;

/**
 * Common interface for HTMLCanvasElement, OffscreenCanvas, and other custom canvas classes.
 * @memberof PIXI
 */
export interface ICanvas
{
    /** Width of the canvas. */
    width: number;
    /** Height of the canvas. */
    height: number;

    /**
     * Get rendering context of the canvas.
     * @param {ContextIds} contextId - The identifier of the type of context to create.
     * @param {any} options - The options for creating context.
     * @returns {RenderingContext | null} The created context, or null if contextId is not supported.
     */
    getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings):
    ICanvasRenderingContext2D | null;
    getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings):
    ImageBitmapRenderingContext | null;
    getContext(contextId: 'webgl' | 'experimental-webgl', options?: WebGLContextAttributes):
    WebGLRenderingContext | null;
    getContext(contextId: 'webgl2' | 'experimental-webgl2', options?: WebGLContextAttributes):
    WebGL2RenderingContext | null;
    getContext(contextId: ContextIds, options?: any): RenderingContext | null;

    /**
     * Get the content of the canvas as data URL.
     * @param {string} type - The MIME type for the image format to return. If not specify, the default value is image/png.
     * @param {any} options - The options for creating data URL.
     * @returns {string} The content of the canvas as data URL.
     */
    toDataURL?(type?: string, options?: any): string;
}

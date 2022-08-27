type RenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type RenderingContext = RenderingContext2D | ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext;

/** Common interface for HTMLCanvasElement and OffscreenCanvas */
export interface ICanvas
{
    width: number;
    height: number;

    getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): RenderingContext2D | null;
    getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings):
    ImageBitmapRenderingContext | null;
    getContext(contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;
    getContext(contextId: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null;
    getContext(contextId: string, options?: any): RenderingContext | null;
}

export type ContextAttributes = WebGLContextAttributes | CanvasRenderingContext2DSettings;
export type Context = WebGLRenderingContext | CanvasRenderingContext2D;
export type ContextIds = '2d' | 'webgl' | 'experimental-webgl' | 'webgl2';
export type CanvasElement = {
    getContext(contextId: ContextIds, contextAttributes?: ContextAttributes): Context;
};

export interface IAdapter
{
    getContext(canvas: CanvasElement, contextId: ContextIds, contextAttributes?: ContextAttributes): Context;
    createCanvas: (width?: number, height?: number) => HTMLCanvasElement;
    getWebGLRenderingContext: () => typeof WebGLRenderingContext;
    getNavigator: () => Navigator;
}

export const BrowserAdapter = {
    createCanvas: (width: number, height: number): HTMLCanvasElement =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        return canvas;
    },
    getContext: (canvas: CanvasElement, contextId: ContextIds, contextAttributes?: ContextAttributes): Context =>
    {
        canvas = canvas ?? document.createElement('canvas');

        return canvas.getContext(contextId, contextAttributes) as Context;
    },
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => navigator
} as IAdapter;

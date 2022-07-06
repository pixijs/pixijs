export type ContextIds = '2d' | 'webgl' | 'experimental-webgl' | 'webgl2';

export interface IAdapter
{
    createCanvas: (width?: number, height?: number) => HTMLCanvasElement;
    getWebGLRenderingContext: () => typeof WebGLRenderingContext;
    getNavigator: () => Navigator;
    getBaseUrl: () => string;
}

export const BrowserAdapter = {
    createCanvas: (width: number, height: number): HTMLCanvasElement =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        return canvas;
    },
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => navigator,
    getBaseUrl: () => document.baseURI ?? window.location.href,
} as IAdapter;

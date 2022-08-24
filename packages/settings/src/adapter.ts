export type ContextIds = '2d' | 'webgl' | 'experimental-webgl' | 'webgl2';

/**
 * This interface describes all the DOM dependent calls that Pixi makes throughout its codebase
 * Implementations of this interface can be used to make sure Pixi will work in any environment
 * such as browser, web workers, and node
 */
export interface IAdapter
{
    /** Returns a canvas object that can be used to create a webgl context. */
    createCanvas: (width?: number, height?: number) => HTMLCanvasElement;
    /** Returns a webgl rendering context. */
    getWebGLRenderingContext: () => typeof WebGLRenderingContext;
    /** Returns a partial implementation of the browsers window.navigator */
    getNavigator: () => { userAgent: string };
    /** Returns the current base URL For browser environments this is either the document.baseURI or window.location.href */
    getBaseUrl: () => string;
    fetch: (url: RequestInfo, options?: RequestInit) => Promise<Response>;
}

export const BrowserAdapter = {
    /**
     * Creates a canvas element of the given size.
     * This canvas is created using the browser's native canvas element.
     * @param width - width of the canvas
     * @param height - height of the canvas
     */
    createCanvas: (width: number, height: number): HTMLCanvasElement =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        return canvas;
    },
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => navigator,
    getBaseUrl: () => (document.baseURI ?? window.location.href),
    fetch: (url: RequestInfo, options?: RequestInit) => fetch(url, options),
} as IAdapter;

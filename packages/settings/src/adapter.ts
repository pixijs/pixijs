import type { ICanvas } from './ICanvas';
import type { ICanvasRenderingContext2D } from './ICanvasRenderingContext2D';

/**
 * This interface describes all the DOM dependent calls that Pixi makes throughout its codebase.
 * Implementations of this interface can be used to make sure Pixi will work in any environment,
 * such as browser, Web Workers, and Node.js.
 * @memberof PIXI
 */
export interface IAdapter
{
    /** Returns a canvas object that can be used to create a webgl context. */
    createCanvas: (width?: number, height?: number) => ICanvas;
    /** Returns a 2D rendering context. */
    getCanvasRenderingContext2D: () => { prototype: ICanvasRenderingContext2D; };
    /** Returns a WebGL rendering context. */
    getWebGLRenderingContext: () => typeof WebGLRenderingContext;
    /** Returns a partial implementation of the browsers window.navigator */
    getNavigator: () => { userAgent: string };
    /** Returns the current base URL For browser environments this is either the document.baseURI or window.location.href */
    getBaseUrl: () => string;
    getFontFaceSet: () => FontFaceSet | null;
    fetch: (url: RequestInfo, options?: RequestInit) => Promise<Response>;
    parseXML: (xml: string) => Document;
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
    getCanvasRenderingContext2D: () => CanvasRenderingContext2D,
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => navigator,
    getBaseUrl: () => (document.baseURI ?? window.location.href),
    getFontFaceSet: () => document.fonts,
    fetch: (url: RequestInfo, options?: RequestInit) => fetch(url, options),
    parseXML: (xml: string) =>
    {
        const parser = new DOMParser();

        return parser.parseFromString(xml, 'text/xml');
    },
} as IAdapter;

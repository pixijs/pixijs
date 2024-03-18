import { type Adapter } from '../environment/adapter';

/**
 * This is an implementation of the {@link environment.Adapter} interface.
 * It can be used to make Pixi work in the browser.
 * @memberof environment
 * @property {Function} createCanvas - Creates a canvas element of the given size.
 * This canvas is created using the browser's native canvas element.
 * @property {Function} getCanvasRenderingContext2D - Returns a 2D rendering context.
 * @property {Function} getWebGLRenderingContext - Returns a WebGL rendering context.
 * @property {Function} getNavigator - Returns browsers window.navigator
 * @property {Function} getBaseUrl - Returns the current base URL for browser environments this is either
 * the document.baseURI or window.location.href
 * @property {Function} getFontFaceSet - Return the font face set if available
 * @property {Function} fetch - Returns a Response object that has been fetched from the given URL.
 * @property {Function} parseXML - Returns Document object that has been parsed from the given XML string.
 */
export const BrowserAdapter = {
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
} as Adapter;

import { BrowserAdapter } from './browser/BrowserAdapter';

import type { ICanvas } from './canvas/ICanvas';
import type { ICanvasRenderingContext2D } from './canvas/ICanvasRenderingContext2D';

/**
 * PixiJS supports multiple environments including browsers, Web Workers, and Node.js.
 * The environment is auto-detected by default using the {@link environment.autoDetectEnvironment} function.
 *
 * However you can manually set the environment using the {@link environment.DOMAdapter} singleton.
 * ```js
 * import { DOMAdapter, WebWorkerAdapter } from 'pixi.js';
 * DOMAdapter.set(WebWorkerAdapter);
 * DOMAdapter.get().createCanvas(800, 600); // returns an offscreen canvas
 * ```
 * @namespace environment
 */

/**
 * This interface describes all the DOM dependent calls that Pixi makes throughout its codebase.
 * Implementations of this interface can be used to make sure Pixi will work in any environment,
 * such as browser, Web Workers, and Node.js.
 * @memberof environment
 */
export interface Adapter
{
    /** Returns a canvas object that can be used to create a webgl context. */
    createCanvas: (width?: number, height?: number) => ICanvas;
    /** Returns a 2D rendering context. */
    getCanvasRenderingContext2D: () => { prototype: ICanvasRenderingContext2D; };
    /** Returns a WebGL rendering context. */
    getWebGLRenderingContext: () => typeof WebGLRenderingContext;
    /** Returns a partial implementation of the browsers window.navigator */
    getNavigator: () => { userAgent: string, gpu: GPU | null };
    /** Returns the current base URL For browser environments this is either the document.baseURI or window.location.href */
    getBaseUrl: () => string;
    /** Return the font face set if available */
    getFontFaceSet: () => FontFaceSet | null;
    /** Returns a Response object that has been fetched from the given URL. */
    fetch: (url: RequestInfo, options?: RequestInit) => Promise<Response>;
    /** Returns Document object that has been parsed from the given XML string. */
    parseXML: (xml: string) => Document;
}

let currentAdapter: Adapter = BrowserAdapter;

/**
 * The DOMAdapter is a singleton that allows PixiJS to perform DOM operations, such as creating a canvas.
 * This allows PixiJS to be used in any environment, such as a web browser, Web Worker, or Node.js.
 *
 * Defaults to the {@link environment.BrowserAdapter}.
 * @example
 * import { DOMAdapter, WebWorkerAdapter } from 'pixi.js';
 * DOMAdapter.set(WebWorkerAdapter);
 * DOMAdapter.get().createCanvas(800, 600); // returns an offscreen canvas
 * @memberof environment
 */
export const DOMAdapter = {
    get(): Adapter
    {
        return currentAdapter;
    },
    set(adapter: Adapter): void
    {
        currentAdapter = adapter;
    },
};

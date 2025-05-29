import { BrowserAdapter } from '../environment-browser/BrowserAdapter';

import type { ICanvas } from './canvas/ICanvas';
import type { ICanvasRenderingContext2D } from './canvas/ICanvasRenderingContext2D';

/**
 * This interface describes all the DOM dependent calls that Pixi makes throughout its codebase.
 * Implementations of this interface can be used to make sure Pixi will work in any environment,
 * such as browser, Web Workers, and Node.js.
 * @category environment
 * @advanced
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
 * It uses the {@link Adapter} interface to abstract away the differences between these environments
 * and uses the {@link BrowserAdapter} by default.
 *
 * It has two methods: `get():Adapter` and `set(adapter: Adapter)`.
 *
 * Defaults to the {@link BrowserAdapter}.
 * @example
 * import { DOMAdapter, WebWorkerAdapter } from 'pixi.js';
 *
 * // WebWorkerAdapter is an implementation of the Adapter interface
 * DOMAdapter.set(WebWorkerAdapter);
 *
 * // use the adapter to create a canvas (in this case an OffscreenCanvas)
 * DOMAdapter.get().createCanvas(800, 600);
 * @category environment
 * @advanced
 */
export const DOMAdapter = {
    /**
     * Returns the current adapter.
     * @returns {environment.Adapter} The current adapter.
     */
    get(): Adapter
    {
        return currentAdapter;
    },
    /**
     * Sets the current adapter.
     * @param adapter - The new adapter.
     */
    set(adapter: Adapter): void
    {
        currentAdapter = adapter;
    },
};

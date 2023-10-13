import { BrowserAdapter } from './browser/browser';

import type { ICanvas } from './canvas/ICanvas';
import type { ICanvasRenderingContext2D } from './canvas/ICanvasRenderingContext2D';

/**
 * This interface describes all the DOM dependent calls that Pixi makes throughout its codebase.
 * Implementations of this interface can be used to make sure Pixi will work in any environment,
 * such as browser, Web Workers, and Node.js.
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
    getFontFaceSet: () => FontFaceSet | null;
    fetch: (url: RequestInfo, options?: RequestInit) => Promise<Response>;
    parseXML: (xml: string) => Document;
}

let currentAdapter: Adapter = BrowserAdapter;

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

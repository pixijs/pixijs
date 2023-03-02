import { settings } from '@pixi/core';
import { DOMParser } from '@xmldom/xmldom';

import type { IAdapter } from '@pixi/core';

export const WebWorkerAdapter = {
    /**
     * Creates a canvas element of the given size.
     * This canvas is created using the browser's native canvas element.
     * @param width - width of the canvas
     * @param height - height of the canvas
     */
    createCanvas: (width?: number, height?: number) => new OffscreenCanvas(width ?? 0, height ?? 0),
    getCanvasRenderingContext2D: () => OffscreenCanvasRenderingContext2D,
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => navigator,
    getBaseUrl: () => globalThis.location.href,
    getFontFaceSet: () => (globalThis as unknown as WorkerGlobalScope).fonts,
    fetch: (url: RequestInfo, options?: RequestInit) => fetch(url, options),
    parseXML: (xml: string) =>
    {
        const parser = new DOMParser();

        return parser.parseFromString(xml, 'text/xml');
    },

} as IAdapter;

settings.ADAPTER = WebWorkerAdapter;

export { settings };

import { settings } from '@pixi/settings';

import type { IAdapter } from '@pixi/settings';

export const WebWorkerAdapter = {
    /**
     * Creates a canvas element of the given size.
     * This canvas is created using the browser's native canvas element.
     * @param width - width of the canvas
     * @param height - height of the canvas
     */
    createCanvas: (width?: number, height?: number): OffscreenCanvas =>
        new OffscreenCanvas(width | 0, height | 0),
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => navigator,
    getBaseUrl: () => globalThis.location.href,
    getFontFaceSet: () => (globalThis as unknown as WorkerGlobalScope).fonts,
    fetch: (url: RequestInfo, options?: RequestInit) => fetch(url, options),
} as IAdapter;

settings.ADAPTER = WebWorkerAdapter;

export { settings };

import type { IAdapter } from '@pixi/settings';
import { settings } from '@pixi/settings';
import gl from 'gl';
import { NodeCanvasElement } from './NodeCanvasElement';

export const NodeAdapter = {
    /**
     * Creates a canvas element of the given size.
     * This canvas is created using the node-canvas package and uses the gl package to create a webgl context.
     * @param width - width of the canvas
     * @param height - height of the canvas
     */
    createCanvas: (width?: number, height?: number) => new NodeCanvasElement(width, height) as unknown as HTMLCanvasElement,
    /** Returns a webgl rendering context using the gl package. */
    getWebGLRenderingContext: () => gl as unknown as typeof WebGLRenderingContext,
    /** Returns the fake user agent string of `node` */
    getNavigator: () => ({ userAgent: 'node' }),
    /** Returns an empty base url */
    getBaseUrl: () => ('/'),
} as IAdapter;

settings.ADAPTER = NodeAdapter;

export { settings };

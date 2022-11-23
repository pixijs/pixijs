import { fetch, Request, Response } from 'cross-fetch';
import fs from 'fs';
import { WebGLRenderingContext } from 'gl';
import { settings, utils } from '@pixi/core';
import { NodeCanvasElement } from './NodeCanvasElement';

import type { IAdapter } from '@pixi/core';

export const NodeAdapter = {
    /**
     * Creates a canvas element of the given size.
     * This canvas is created using the node-canvas package and uses the gl package to create a webgl context.
     * @param width - width of the canvas
     * @param height - height of the canvas
     */
    createCanvas: (width?: number, height?: number) => new NodeCanvasElement(width, height),
    /** Returns a webgl rendering context using the gl package. */
    getWebGLRenderingContext: () => WebGLRenderingContext,
    /** Returns the fake user agent string of `node` */
    getNavigator: () => ({ userAgent: 'node' }),
    /** Returns the path from which the process is being run */
    getBaseUrl: () => process.cwd(),
    getFontFaceSet: () => null,
    fetch: (url: RequestInfo, options?: RequestInit) =>
    {
        const request = new Request(url, options);

        // Check if urls starts with http(s) as only these are supported by node-fetch
        if (utils.path.isUrl(request.url))
        {
            return fetch(url, request);
        }

        return new Promise((resolve, reject) =>
        {
            const filePath = utils.path.normalize(request.url);

            if (!fs.existsSync(filePath))
            {
                reject(`File not found: ${filePath}`);
            }
            const readStream = fs.createReadStream(filePath);

            readStream.on('open', () =>
            {
                resolve(new Response(readStream as unknown as ReadableStream, {
                    url: request.url,
                    status: 200,
                    statusText: 'OK',
                    size: fs.statSync(filePath).size,
                    timeout: (request as any).timeout,
                } as ResponseInit));
            });
        });
    },
} as IAdapter;

settings.ADAPTER = NodeAdapter;

export { settings };

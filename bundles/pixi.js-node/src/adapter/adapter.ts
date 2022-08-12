import type { IAdapter } from '@pixi/settings';
import { settings } from '@pixi/settings';
import { fetch, Request, Response } from 'cross-fetch';
import gl from 'gl';
import { NodeCanvasElement } from './NodeCanvasElement';

import fs from 'fs';
import path from 'path';

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
    /** Returns the path from which the process is being run */
    getBaseUrl: () => process.cwd(),
    /** Returns the root of the path from which the process is being run */
    getRootUrl: () =>
    {
        if (process.platform === 'win32')
        {
            return `${process.cwd().split('\\')[0]}\\`;
        }

        return '';
    },
    fetch: (url: RequestInfo, options?: RequestInit) =>
    {
        const request = new Request(url, options);

        // check if urls starts with http(s) as only these are supported by node-fetch
        if ((/^https?:/).test(request.url))
        {
            return fetch(url, request);
        }

        return new Promise((resolve, reject) =>
        {
            const filePath = path.normalize(request.url);

            if (!fs.existsSync(filePath))
            {
                reject(`File not found: ${filePath}`);
            }
            const readStream = fs.createReadStream(filePath);

            // eslint-disable-next-line func-names
            readStream.on('open', function ()
            {
                resolve(new Response(readStream as unknown as ReadableStream, {
                    url: request.url,
                    status: 200,
                    statusText: 'OK',
                    size: fs.statSync(filePath).size,
                    timeout: (request as any).timeout
                } as unknown as ResponseInit));
            });
        });
    },
} as IAdapter;

settings.ADAPTER = NodeAdapter;

export { settings };

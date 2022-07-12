import { fetch, Response, Request } from 'cross-fetch';

import fs from 'fs';
import path from 'path';

// eslint-disable-next-line func-names
globalThis.fetch = function (url, options)
{
    const request = new Request(url, options);

    try
    {
        // eslint-disable-next-line no-new
        new URL(request.url);

        return fetch(url, request);
    }
    catch (error)
    {
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
    }

    // if (request.url.startsWith('file://'))
    // {
    // }

    // return fetch(url, options);
};

globalThis.requestAnimationFrame = function requestAnimationFrame(fn)
{
    return setTimeout(fn, 1000 / 60);
};

globalThis.cancelAnimationFrame = function cancelAnimationFrame(fn)
{
    return clearTimeout(fn);
};

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const mimeTypes: Record<string, string> = {
    '.gif': 'image/gif',
};

/**
 * Very HTTP server to requesting files.
 */
const createServer = (port: number) =>
{
    const server = http.createServer((request, response) =>
    {
        const filePath = path.join(__dirname, request.url ?? '');
        const extname = path.extname(filePath);
        const contentType = mimeTypes[extname] || 'text/html';

        const stream = fs.createReadStream(filePath);

        stream.once('open', () =>
        {
            response.writeHead(200, { 'Content-Type': contentType });
            stream.pipe(response);
        });

        stream.once('error', (error) =>
        {
            response.writeHead(404);
            response.end(`File not found: ${error} ..\n`);
            response.end();
        });
    });

    server.listen(port);

    return server;
};

export { createServer };

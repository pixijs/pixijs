/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const mimeTypes = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.wav': 'audio/wav',
};

/**
 * Very HTTP server to requesting files.
 */
const createServer = (port) =>
{
    const server = http.createServer((request, response) =>
    {
        const filePath = path.join(__dirname, request.url);
        const extname = path.extname(filePath);
        const contentType = mimeTypes[extname] || 'text/html';

        fs.readFile(filePath, (error, content) =>
        {
            if (error)
            {
                if (error.code === 'ENOENT')
                {
                    response.writeHead(404);
                    response.end(`File not found: ${error.code} ..\n`);
                    response.end();
                }
                else
                {
                    response.writeHead(500);
                    response.end(`Internal server error: ${error.code} ..\n`);
                    response.end();
                }
            }
            else
            {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    });

    server.listen(port);

    return server;
};

export { createServer };

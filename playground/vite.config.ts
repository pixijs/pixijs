import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type ViteDevServer } from 'vite';
import preact from '@preact/preset-vite';

import type { IncomingMessage, ServerResponse } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const buildStatusPath = resolve(root, '.build-status.json');

const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    json: 'application/json',
    fnt: 'text/plain',
    xml: 'application/xml',
    ttf: 'font/ttf',
    otf: 'font/otf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    basis: 'application/octet-stream',
    ktx: 'application/octet-stream',
    ktx2: 'application/octet-stream',
    dds: 'application/octet-stream',
    mp4: 'video/mp4',
    webm: 'video/webm',
    svg: 'image/svg+xml',
};

function serveStatic(res: ServerResponse, filePath: string): boolean
{
    if (!existsSync(filePath))
    {
        res.statusCode = 404;
        res.end('Not found');

        return true;
    }

    const ext = filePath.split('.').pop()?.toLowerCase();

    res.setHeader('Content-Type', mimeTypes[ext ?? ''] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(readFileSync(filePath));

    return true;
}

const staticRoutes: Record<string, string> = {
    '/test-assets/': 'tests/visual/assets/',
    '/test-utils-assets/': 'tests/utils/assets/',
    '/snapshots/': 'tests/visual/snapshots/',
};

export default defineConfig({
    resolve: {
        alias: {
            'pixi.js': resolve(root, 'lib/index.mjs'),
            '~': resolve(root, 'lib'),
            '@test-utils': resolve(__dirname, 'src/scenes/testUtilsShim.ts'),
        }
    },
    plugins: [
        preact(),
        {
            name: 'raw-shader-loader',
            transform(code: string, id: string)
            {
                if ((/\.(frag|vert|wgsl)$/).test(id))
                {
                    return {
                        code: `export default ${JSON.stringify(code)};`,
                        map: null,
                    };
                }

                return undefined;
            }
        },
        {
            name: 'serve-static-assets',
            configureServer(server: ViteDevServer)
            {
                server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) =>
                {
                    if (req.url?.startsWith('/.build-status.json'))
                    {
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Cache-Control', 'no-cache');

                        if (existsSync(buildStatusPath))
                        {
                            res.end(readFileSync(buildStatusPath, 'utf-8'));
                        }
                        else
                        {
                            res.end(JSON.stringify({ status: 'ready', completedAt: Date.now() }));
                        }

                        return;
                    }

                    for (const [prefix, dir] of Object.entries(staticRoutes))
                    {
                        if (req.url?.startsWith(prefix))
                        {
                            serveStatic(res, resolve(root, dir, req.url.replace(prefix, '')));

                            return;
                        }
                    }

                    next();
                });
            }
        }
    ],
    build: {
        target: 'esnext',
    },
    server: {
        fs: {
            allow: [root],
        }
    }
});

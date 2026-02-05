import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildStatusPath = resolve(__dirname, '../.build-status.json');

export default defineConfig({
    resolve: {
        alias: {
            'pixi.js': fileURLToPath(new URL('../lib/index.mjs', import.meta.url))
        }
    },
    plugins: [
        {
            name: 'serve-build-status',
            configureServer(server)
            {
                server.middlewares.use((req, res, next) =>
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
                    next();
                });
            }
        }
    ]
});

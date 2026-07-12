/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('crypto');

// the Electron renderer that jest-electron transforms in has no worker_threads;
// force esbuild's child-process sync fallback (must be set before requiring esbuild)
process.env.ESBUILD_WORKER_THREADS = '0';

const { buildSync } = require('esbuild');

/**
 * The stock `@pixi/webworker-plugins/lib/jest-transform` transpiles the worker entry file
 * in isolation (via ts-jest) and wraps the CJS output in a blob Worker. Any worker with
 * value imports then crashes on startup with `ReferenceError: exports is not defined`,
 * because CJS globals don't exist in a Worker scope. The production rollup-plugin avoids
 * this by bundling the worker into an IIFE first; this transform does the same with esbuild.
 */

const bundleCache = new Map();

function bundle(sourcePath)
{
    if (!bundleCache.has(sourcePath))
    {
        const result = buildSync({
            entryPoints: [sourcePath],
            bundle: true,
            write: false,
            format: 'iife',
            target: 'es2020',
        });

        bundleCache.set(sourcePath, result.outputFiles[0].text);
    }

    return bundleCache.get(sourcePath);
}

// mirrors @pixi/webworker-plugins/lib/core buildWorkerCode (not exported by the package)
function buildWorkerCode(source)
{
    return `const WORKER_CODE = ${JSON.stringify(source)};
let WORKER_URL = null;
class WorkerInstance
{
    constructor()
    {
        if (!WORKER_URL)
        {
            WORKER_URL = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'application/javascript' }));
        }
        this.worker = new Worker(WORKER_URL);
    }
}
WorkerInstance.revokeObjectURL = function revokeObjectURL()
{
    if (WORKER_URL)
    {
        URL.revokeObjectURL(WORKER_URL);
        WORKER_URL = null;
    }
}
module.exports = WorkerInstance;`;
}

module.exports = {
    getCacheKey(sourceText, sourcePath)
    {
        // hash the bundled output so edits to the worker's imports invalidate the cache
        return crypto.createHash('sha1').update(bundle(sourcePath)).digest('hex');
    },
    process(sourceText, sourcePath)
    {
        return buildWorkerCode(bundle(sourcePath));
    },
};

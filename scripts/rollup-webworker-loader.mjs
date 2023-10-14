import { resolve } from 'node:path';
import { rollup } from 'rollup';
import webworkerLoader from './webworker-loader.js';

const PLUGIN_NAME = '@pixi/webworker-loader/rollup-plugin';
const VIRTUAL_MODULE_PREFIX = `\0${PLUGIN_NAME}:`;

const DEFAULT_OPTIONS = {
    worker: {
        pattern: /(.+\.worker\.[cm]?[jt]s)/,
        assertionType: 'worker',
    },
};

export default (() =>
{
    const state = {
        exclude: new Set(),
    };

    return {
        name: PLUGIN_NAME,

        options(options)
        {
            state.options = options;

            return null;
        },
        resolveId(source, importer, options)
        {
            let importee = null;

            const assertType = options.assertions.type;

            if (assertType === DEFAULT_OPTIONS.worker.assertionType) importee = source;
            else
            {
                const patternMatch = source.match(DEFAULT_OPTIONS.worker.pattern);

                if (patternMatch) importee = patternMatch[1];
            }

            if (importee === null) return null;

            const resolvedPath = resolve(importer ? resolve(importer, '..') : '.', importee);
            const id = VIRTUAL_MODULE_PREFIX + resolvedPath;

            if (state.exclude.has(id)) return null;

            return {
                id,
                assertions: { type: DEFAULT_OPTIONS.worker.assertionType },
            };
        },
        async load(id)
        {
            if (!id.startsWith(VIRTUAL_MODULE_PREFIX)) return null;

            const source = id.slice(VIRTUAL_MODULE_PREFIX.length);

            state.exclude.add(id);

            const bundle = await rollup({
                plugins: state.options.plugins,
                input: source,
            });

            state.exclude.delete(id);

            const output = await bundle.generate({
                format: 'iife',
                name: 'WorkerLoader',
                sourcemap: 'inline', // TODO: Use external source map?
            });

            const workerCode = output.output[0].code;

            const code = webworkerLoader.buildWorkerCode(workerCode, 'esm');

            return {
                code,
                assertions: { type: DEFAULT_OPTIONS.worker.assertionType },
            };
        },
    };
});

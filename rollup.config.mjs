import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import externalGlobals from 'rollup-plugin-external-globals';
import jscc from 'rollup-plugin-jscc';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { string } from 'rollup-plugin-string';
import { fileURLToPath } from 'url';
import webworker from '@pixi/webworker-plugins/rollup-plugin';
import repo from './package.json' assert { type: 'json' };
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

const bundleTarget = 'es2017';
const moduleTarget = 'es2020';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert a development file name to minified.
 * @param {string} name
 */
function prodName(name)
{
    return name.replace(/\.(m)?js$/, '.min.$1js');
}

/**
 * Escapes the `RegExp` special characters.
 * @param {string} str
 */
function escapeRegExp(str)
{
    return str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');
}

/**
 * Convert the name of a package to a `RegExp` that matches the package's export names.
 * @param {string} packageName
 */
function convertPackageNameToRegExp(packageName)
{
    return new RegExp(`^${escapeRegExp(packageName)}(/.+)?$`);
}

async function main()
{
    const commonPlugins = [
        sourcemaps(),
        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs(),
        json(),
        string({
            include: [
                '**/*.frag',
                '**/*.vert',
                '**/*.glsl',
                '**/*.wgsl',
            ],
        }),
        // We need to satisfy our tsconfig alias with rollup
        // even though we'll be excluding __tests___
        alias({
            entries: [
                { find: /^~\/(.*)$/, replacement: path.join(__dirname, 'src/$1.ts') },
                { find: '@test-utils', replacement: path.join(__dirname, 'tests/utils/index.ts') }
            ]
        })
    ];

    const plugins = [
        webworker(),
        jscc({ values: { _VERSION: repo.version, _DEBUG: true } }),
        esbuild({ target: moduleTarget, exclude: ['**/__tests__/**'] }),
        ...commonPlugins
    ];

    const bundlePlugins = [
        webworker(),
        jscc({ values: { _VERSION: repo.version, _DEBUG: true } }),
        esbuild({ target: bundleTarget }),
        ...commonPlugins
    ];

    const bundlePluginsProd = [
        webworker(),
        jscc({ values: { _VERSION: repo.version, _DEBUG: false } }),
        esbuild({ target: bundleTarget, minify: true }),
        ...commonPlugins,
    ];

    const results = [];

    const {
        bundles,
        dependencies = {},
        peerDependencies = {},
        sideEffects
    } = repo;

    // Check for bundle folder
    const external = Object.keys(dependencies)
        .concat(Object.keys(peerDependencies))
        .map(convertPackageNameToRegExp);
    const input = [
        ...sideEffects.map((name) => path.join(process.cwd(), name.replace('/lib/', '/src/').replace('.*', '.ts'))),
    ];

    results.push({
        input,
        output: [
            {
                dir: path.join(process.cwd(), 'lib'),
                entryFileNames: '[name].js',
                format: 'cjs',
                freeze: false,
                sourcemap: true,
                preserveModules: true,
                preserveModulesRoot: path.join(process.cwd(), 'src'),
                exports: 'named',
            },
            {
                dir: path.join(process.cwd(), 'lib'),
                entryFileNames: '[name].mjs',
                format: 'esm',
                freeze: false,
                sourcemap: true,
                preserveModules: true,
                preserveModulesRoot: path.join(process.cwd(), 'src'),
                exports: 'named',
            },
        ],
        treeshake: false,
        external,
        plugins,
    });

    const banner = [
        `/*!`,
        ` * PixiJS - v${repo.version}`,
        ` * Compiled ${(new Date()).toUTCString().replace(/GMT/g, 'UTC')}`,
        ` *`,
        ` * PixiJS is licensed under the MIT License.`,
        ` * http://www.opensource.org/licenses/mit-license`,
        ` */`,
    ].join('\n');

    // The package.json file has a bundle field
    // we'll use this to generate the bundle file
    // this will package all dependencies
    if (bundles && !process.env.LIB_ONLY)
    {
        bundles.forEach((bundle) =>
        {
            const file = path.join(process.cwd(), bundle.target);
            const moduleFile = bundle.module ? path.join(process.cwd(), bundle.module) : '';
            const nsBanner = bundle.plugin ? `${banner}\nthis.PIXI = this.PIXI || {};` : banner;
            const name = bundle.plugin ? bundle.target.split('/').at(-1).replace(/[^a-z]+/g, '_') : 'PIXI';
            const footer = bundle.plugin ? `Object.assign(this.PIXI, ${name});` : '';

            // if a bundle is a plugin then we need to exclude its imports from the bundle
            // so they ca nbe added to the global scope
            const external = bundle.plugin ? (id) => bundle.plugin.some((plugin) => id.includes(plugin)) : undefined;
            // eslint-disable-next-line consistent-return
            const externalPlugin = bundle.plugin ? externalGlobals((id) => { if (external(id)) return 'PIXI'; }) : undefined;

            results.push({
                input: path.join(process.cwd(), bundle.src),
                external,
                output: [
                    {
                        name,
                        banner: nsBanner,
                        footer,
                        file,
                        format: 'iife',
                        freeze: false,
                        sourcemap: true,
                    },
                    !bundle.plugin
                    && {
                        banner: nsBanner,
                        file: moduleFile,
                        format: 'esm',
                        freeze: false,
                        sourcemap: true,
                    }
                ],
                treeshake: false,
                plugins: [...bundlePlugins, externalPlugin],
            }, {
                input: path.join(process.cwd(), bundle.src),
                external,
                output: [
                    {
                        name,
                        banner: nsBanner,
                        footer,
                        file: prodName(file),
                        format: 'iife',
                        freeze: false,
                        sourcemap: true,
                    },
                    !bundle.plugin
                    && {
                        banner: nsBanner,
                        file: prodName(moduleFile),
                        format: 'esm',
                        freeze: false,
                        sourcemap: true,
                    }
                ],
                treeshake: false,
                plugins: [...bundlePluginsProd, externalPlugin]
            });
        });
    }

    return results;
}

export default main();

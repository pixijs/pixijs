import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import jscc from 'rollup-plugin-jscc';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { string } from 'rollup-plugin-string';
import webWorkerLoader from '@pixi/rollup-plugin-web-worker-loader';
import repo from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

const bundleTarget = 'es2017';
const moduleTarget = 'es2020';

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
        webWorkerLoader({
            external: [],
        }),
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
    ];

    const plugins = [
        jscc({ values: { _VERSION: repo.version, _DEBUG: true } }),
        esbuild({ target: moduleTarget }),
        ...commonPlugins
    ];

    const bundlePlugins = [
        jscc({ values: { _VERSION: repo.version, _DEBUG: true } }),
        esbuild({ target: bundleTarget }),
        ...commonPlugins
    ];

    const bundlePluginsProd = [
        jscc({ values: { _VERSION: repo.version, _DEBUG: false } }),
        esbuild({ target: bundleTarget, minify: true }),
        ...commonPlugins,
    ];

    const results = [];

    const {
        bundle,
        bundleModule,
        dependencies = {},
        peerDependencies = {},
    } = repo;

    // Check for bundle folder
    const external = Object.keys(dependencies)
        .concat(Object.keys(peerDependencies))
        .map(convertPackageNameToRegExp);
    const input = path.join(process.cwd(), 'src/index.ts');

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
    if (bundle && !process.env.LIB_ONLY)
    {
        const file = path.join(process.cwd(), bundle);
        const moduleFile = bundleModule ? path.join(process.cwd(), bundleModule) : '';

        results.push({
            input,
            output: [
                {
                    name: 'PIXI',
                    banner,
                    file,
                    format: 'iife',
                    freeze: false,
                    sourcemap: true,
                },
                {
                    banner,
                    file: moduleFile,
                    format: 'esm',
                    freeze: false,
                    sourcemap: true,
                }
            ],
            treeshake: false,
            plugins: bundlePlugins,
        }, {
            input,
            output: [
                {
                    name: 'PIXI',
                    banner,
                    file: prodName(file),
                    format: 'iife',
                    freeze: false,
                    sourcemap: true,
                },
                {
                    banner,
                    file: prodName(moduleFile),
                    format: 'esm',
                    freeze: false,
                    sourcemap: true,
                }
            ],
            treeshake: false,
            plugins: bundlePluginsProd,
        });
    }

    return results;
}

export default main();

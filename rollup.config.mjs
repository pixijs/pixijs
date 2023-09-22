import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import workspacesRun from 'workspaces-run';
import repo from './package.json' assert { type: 'json' };

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
            ],
        }),
        // Import bundle dependencies from the source files
        // not from the build lib files, this will make sure
        // that conditional stuff works correctly (e.g., process.env.DEBUG)
        alias({
            entries: [
                { find: 'pixi.js', replacement: './bundles/pixi.js/src/index.ts' },
                { find: /^@pixi\/(?!colord)(.+)$/, replacement: './packages/$1/src/index.ts' },
            ]
        }),
    ];

    const esbuildConfig = {
        target: moduleTarget,
        minifySyntax: true,
        define: {
            'process.env.VERSION': `'${repo.version}'`,
            'process.env.DEBUG': 'true',
        },
        treeShaking: true,
        tsconfigRaw: '{"compilerOptions":{"useDefineForClassFields":false}}'
    }

    const plugins = [
        esbuild(esbuildConfig),
        ...commonPlugins,
    ];

    const bundlePlugins = [
        esbuild({ ...esbuildConfig, target: bundleTarget }),
        ...commonPlugins,
    ];

    const bundlePluginsProd = [
        esbuild({
            ...esbuildConfig,
            target: bundleTarget,
            minify: true,
            define: {
                ...esbuildConfig.define,
                'process.env.DEBUG': 'false',
            },
        }),
        ...commonPlugins,
    ];

    const results = [];
    const packages = [];

    // Collect the list of packages
    await workspacesRun.default({ cwd: process.cwd(), orderByDeps: true }, async (pkg) =>
    {
        if (!pkg.config.private)
        {
            packages.push(pkg);
        }
    });

    packages.forEach((pkg) =>
    {
        const {
            plugin,
            pluginExports = true,
            bundle,
            bundleModule,
            dependencies = {},
            peerDependencies = {},
        } = pkg.config;

        // Check for bundle folder
        const external = Object.keys(dependencies)
            .concat(Object.keys(peerDependencies))
            .map(convertPackageNameToRegExp);
        const basePath = path.relative(process.cwd(), pkg.dir);
        const input = path.join(basePath, 'src/index.ts');

        results.push({
            input,
            output: [
                {
                    dir: path.join(basePath, 'lib'),
                    entryFileNames: '[name].js',
                    format: 'cjs',
                    freeze: false,
                    sourcemap: true,
                    preserveModules: true,
                    preserveModulesRoot: path.join(basePath, 'src'),
                    exports: 'named',
                },
                {
                    dir: path.join(basePath, 'lib'),
                    entryFileNames: '[name].mjs',
                    format: 'esm',
                    freeze: false,
                    sourcemap: true,
                    preserveModules: true,
                    preserveModulesRoot: path.join(basePath, 'src'),
                    exports: 'named',
                },
            ],
            treeshake: false,
            external,
            plugins,
        });

        const banner = [
            `/*!`,
            ` * ${pkg.name} - v${repo.version}`,
            ` * Compiled ${(new Date()).toUTCString().replace(/GMT/g, 'UTC')}`,
            ` *`,
            ` * ${pkg.name} is licensed under the MIT License.`,
            ` * http://www.opensource.org/licenses/mit-license`,
            ` */`,
        ].join('\n');

        // There are a handful of optional packages that are not included in the bundle
        // but we still want to build a browser-based version of them, like we would
        // for any external plugin.
        if (plugin)
        {
            const name = pkg.name.replace(/[^a-z]+/g, '_');
            const file = path.join(basePath, plugin);
            const footer = pluginExports ? `Object.assign(this.PIXI, ${name});` : '';
            const nsBanner = pluginExports ? `${banner}\nthis.PIXI = this.PIXI || {};` : banner;
            const globals = Object.keys(peerDependencies).reduce((obj, name) => ({ ...obj, [name]: 'PIXI' }), {});

            results.push({
                input,
                output: {
                    name,
                    banner: nsBanner,
                    footer,
                    file,
                    format: 'iife',
                    freeze: false,
                    sourcemap: true,
                    globals,
                },
                treeshake: false,
                external,
                plugins: bundlePlugins,
            }, {
                input,
                output: {
                    name,
                    banner: nsBanner,
                    footer,
                    file: prodName(file),
                    format: 'iife',
                    freeze: false,
                    sourcemap: true,
                    globals,
                },
                treeshake: false,
                external,
                plugins: bundlePluginsProd,
            });
        }

        // The package.json file has a bundle field
        // we'll use this to generate the bundle file
        // this will package all dependencies
        if (bundle)
        {
            const file = path.join(basePath, bundle);
            const moduleFile = bundleModule ? path.join(basePath, bundleModule) : '';

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
    });

    return results;
}

export default main();

import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import sourcemaps from 'rollup-plugin-sourcemaps';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import jscc from 'rollup-plugin-jscc';
import workspacesRun from 'workspaces-run';
import repo from './lerna.json';

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
            ],
        }),
    ];

    const plugins = [
        jscc({ values: { _VERSION: repo.version } }),
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
    const packages = [];

    // Collect the list of packages
    await workspacesRun({ cwd: __dirname, orderByDeps: true }, async (pkg) =>
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
            version,
            dependencies,
            nodeDependencies,
            peerDependencies,
            pixiRequirements,
        } = pkg.config;

        // Check for bundle folder
        const external = Object.keys(dependencies || [])
            .concat(Object.keys(peerDependencies || []))
            .concat(nodeDependencies || [])
            .concat(pixiRequirements || []);
        const basePath = path.relative(__dirname, pkg.dir);
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
            ` * ${pkg.name} - v${version}`,
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
            const nsBanner = pluginExports ? `${banner}\nthis.PIXI = this.PIXI || {};`: banner;
            const globals = external.reduce((obj, name) => ({ ...obj, [name]: 'PIXI' }), {});

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

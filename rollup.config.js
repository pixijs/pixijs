import path from 'path';
import transpile from '@rollup/plugin-buble';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import jscc from 'rollup-plugin-jscc';
import alias from '@rollup/plugin-alias';
import workspacesRun from 'workspaces-run';
import repo from './lerna.json';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get the JSCC plugin for preprocessing code.
 * @param {boolean} debug Build is for debugging
 */
function preprocessPlugin(debug)
{
    return jscc({
        values: {
            _DEBUG: debug,
            _PROD: !debug,
            _VERSION: repo.version,
        }
    });
}

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
        typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.build.json'),
        }),
        string({
            include: [
                '**/*.frag',
                '**/*.vert',
            ],
        }),
        transpile(),
    ];

    const plugins = [
        preprocessPlugin(true),
        ...commonPlugins
    ];

    const prodPlugins = [
        preprocessPlugin(false),
        ...commonPlugins,
        terser({
            output: {
                comments: (node, comment) => comment.line === 1,
            },
        })
    ];

    const prodBundlePlugins = [
        alias({
            entries: [{
                find: /^(@pixi\/([^\/]+))$/,
                replacement: '$1/dist/esm/$2.min.js',
            }]
        }),
        ...prodPlugins
    ];

    const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
    const sourcemap = true;
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

    const namespaces = {};

    // Create a map of globals to use for bundled packages
    packages.forEach((pkg) =>
    {
        namespaces[pkg.name] = pkg.config.namespace || 'PIXI';
    });

    packages.forEach((pkg) =>
    {
        const {
            main,
            module,
            bundle,
            bundleModule,
            bundleInput,
            bundleOutput,
            bundleNoExports,
            standalone,
            version,
            dependencies,
            peerDependencies } = pkg.config;

        const banner = [
            `/*!`,
            ` * ${pkg.name} - v${version}`,
            ` * Compiled ${compiled}`,
            ` *`,
            ` * ${pkg.name} is licensed under the MIT License.`,
            ` * http://www.opensource.org/licenses/mit-license`,
            ` */`,
        ].join('\n');

        // Check for bundle folder
        const external = Object.keys(dependencies || [])
            .concat(Object.keys(peerDependencies || []));
        const basePath = path.relative(__dirname, pkg.dir);
        const input = path.join(basePath, 'src/index.ts');
        const freeze = false;

        results.push({
            input,
            output: [
                {
                    banner,
                    file: path.join(basePath, main),
                    format: 'cjs',
                    freeze,
                    sourcemap,
                },
                {
                    banner,
                    file: path.join(basePath, module),
                    format: 'esm',
                    freeze,
                    sourcemap,
                },
            ],
            external,
            plugins,
        });

        if (isProduction)
        {
            results.push({
                input,
                output: [
                    {
                        banner,
                        file: path.join(basePath, prodName(main)),
                        format: 'cjs',
                        freeze,
                        sourcemap,
                    },
                    {
                        banner,
                        file: path.join(basePath, prodName(module)),
                        format: 'esm',
                        freeze,
                        sourcemap,
                    },
                ],
                external,
                plugins: prodPlugins,
            });
        }

        // The package.json file has a bundle field
        // we'll use this to generate the bundle file
        // this will package all dependencies
        if (bundle)
        {
            let input = path.join(basePath, bundleInput || 'src/index.ts');

            // TODO: remove check once all packages have been converted to typescript
            if (!fs.existsSync(input))
            {
                input = path.join(basePath, bundleInput || 'src/index.js');
            }

            const file = path.join(basePath, bundle);
            const moduleFile = bundleModule ? path.join(basePath, bundleModule) : '';
            const external = standalone ? null : Object.keys(namespaces);
            const globals = standalone ? null : namespaces;
            const ns = namespaces[pkg.name];
            const name = pkg.name.replace(/[^a-z]+/g, '_');
            let footer;
            let nsBanner = banner;

            // Ignore self-contained packages like polyfills and unsafe-eval
            // as well as the bundles pixi.js and pixi.js-legacy
            if (!standalone)
            {
                if (bundleNoExports !== true)
                {
                    footer = `Object.assign(this.${ns}, ${name});`;
                }

                if (ns.includes('.'))
                {
                    const base = ns.split('.')[0];

                    nsBanner += `\nthis.${base} = this.${base} || {};`;
                }

                nsBanner += `\nthis.${ns} = this.${ns} || {};`;
            }

            results.push({
                input,
                external,
                output: [
                    Object.assign({
                        banner: nsBanner,
                        file,
                        format: 'iife',
                        freeze,
                        globals,
                        name,
                        footer,
                        sourcemap,
                    }, bundleOutput),
                    ...moduleFile ? [{
                        banner,
                        file: moduleFile,
                        format: 'esm',
                        freeze,
                        sourcemap,
                    }] : []
                ],
                treeshake: false,
                plugins,
            });

            if (isProduction)
            {
                results.push({
                    input,
                    external,
                    output: [
                        Object.assign({
                            banner: nsBanner,
                            file: prodName(file),
                            format: 'iife',
                            freeze,
                            globals,
                            name,
                            footer,
                            sourcemap,
                        }, bundleOutput),
                        ...moduleFile ? [{
                            banner,
                            file: prodName(moduleFile),
                            format: 'esm',
                            freeze,
                            sourcemap,
                        }] : []
                    ],
                    treeshake: false,
                    plugins: prodBundlePlugins,
                });
            }
        }
    });

    return results;
}

export default main();

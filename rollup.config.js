import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import sourcemaps from 'rollup-plugin-sourcemaps';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import jscc from 'rollup-plugin-jscc';
import alias from '@rollup/plugin-alias';
import workspacesRun from 'workspaces-run';
import repo from './lerna.json';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';
const bundleTarget = 'es2017';
const moduleTarget = 'es2020';

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
    let commonPlugins = [
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

    let plugins = [
        preprocessPlugin(true),
        esbuild({
            target: moduleTarget,
        }),
        ...commonPlugins
    ];

    const bundlePlugins = [
        preprocessPlugin(true),
        esbuild({
            target: bundleTarget,
        }),
        ...commonPlugins
    ];

    let prodPlugins = [
        preprocessPlugin(false),
        esbuild({
            target: moduleTarget,
            minify: true,
        }),
        ...commonPlugins,
    ];

    const prodBundlePlugins = [
        alias({
            entries: [{
                find: /^(@pixi\/([^\/]+))$/,
                replacement: '$1/dist/esm/$2.min.js',
            }]
        }),
        preprocessPlugin(false),
        esbuild({
            target: bundleTarget,
            minify: true,
        }),
        ...commonPlugins,
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
            peerDependencies,
            // TODO: remove this in v7, along with the declaration in the package.json
            // This is a temporary fix to skip transpiling on the @pixi/node package
            transpile
        } = pkg.config;

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

        if (transpile === 'es6')
        {
            // TODO: this hack is for the @pixi/node package to skip transpiling.
            // This can be removed in v7 where transpiling is no longer required.
            commonPlugins = [
                sourcemaps(),
                resolve({
                    browser: true,
                    preferBuiltins: false,
                }),
                commonjs(),
                json(),
                // TODO: We do still need to keep this plugin for the @pixi/node package as `importHelpers` is required
                typescript({
                    importHelpers: true,
                    target: 'ES2020',
                }),
                string({
                    include: [
                        '**/*.frag',
                        '**/*.vert',
                    ],
                }),
            ];

            plugins = [
                preprocessPlugin(true),
                ...commonPlugins
            ];

            prodPlugins = [
                preprocessPlugin(false),
                ...commonPlugins,
                terser({
                    output: {
                        comments: (node, comment) => comment.line === 1,
                    },
                })
            ];
        }

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

            // Ignore self-contained packages like unsafe-eval
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
                plugins: bundlePlugins,
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

import PackageUtilities from 'lerna/lib/PackageUtilities';
import Repository from 'lerna/lib/Repository';
import path from 'path';
import unfreeze from './tools/rollup-plugin-unfreeze/index';
import transpile from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import string from 'rollup-plugin-string';
import sourcemaps from 'rollup-plugin-sourcemaps';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import minimist from 'minimist';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';

// Support --scope and --ignore globs
const args = minimist(process.argv.slice(2), {
    boolean: ['prod'],
    default: {
        prod: false,
    },
    alias: {
        p: 'prod',
    },
});

// Standard Lerna plumbing getting packages
const repo = new Repository(__dirname);
const packages = PackageUtilities.getPackages(repo);
const filtered = PackageUtilities.filterPackages(packages, args);
const sorted = PackageUtilities.topologicallyBatchPackages(filtered);

const plugins = [
    sourcemaps(),
    resolve({
        browser: true,
        preferBuiltins: true,
    }),
    builtins(),
    commonjs({
        namedExports: {
            'resource-loader': ['Resource'],
            'pixi-gl-core': ['GLFramebuffer', 'GLShader', 'GLBuffer'], // TODO: remove pixi-gl-core
        },
    }),
    string({
        include: [
            '**/*.frag',
            '**/*.vert',
        ],
    }),
    replace({
        __VERSION__: repo.version,
    }),
    transpile(),
    unfreeze(),
];

if (args.prod)
{
    plugins.push(uglify({
        mangle: true,
        compress: true,
        output: {
            comments(node, comment)
            {
                return comment.line === 1;
            },
        },
    }, minify));
}

const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
const sourcemap = true;
const results = [];

sorted.forEach((group) =>
{
    group.forEach((pkg) =>
    {
        if (pkg.isPrivate())
        {
            return;
        }
        const external = Object.keys(pkg.dependencies || []);
        const banner = [
            `/*!`,
            ` * ${pkg.name} - v${pkg.version}`,
            ` * Compiled ${compiled}`,
            ` *`,
            ` * ${pkg.name} is licensed under the MIT License.`,
            ` * http://www.opensource.org/licenses/mit-license`,
            ` */`,
        ];

        // Check for bundle folder
        const basePath = path.relative(__dirname, pkg.location);
        const bundle = basePath.indexOf('bundles/') === 0;

        results.push({
            banner: banner.join('\n'),
            name: 'PIXI',
            input: path.join(basePath, 'src/index.js'),
            treeshake: !bundle,
            output: [
                {
                    file: path.join(basePath, pkg._package.main),
                    format: bundle ? 'umd' : 'cjs',
                },
                {
                    file: path.join(basePath, pkg._package.module),
                    format: 'es',
                },
            ],
            external,
            sourcemap,
            plugins,
        });
    });
});

export default results;

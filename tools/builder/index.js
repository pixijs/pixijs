const path = require('path');
const thaw = require('./thaw');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const string = require('rollup-plugin-string');
const sourcemaps = require('rollup-plugin-sourcemaps');
const uglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const minimist = require('minimist');
const commonjs = require('rollup-plugin-commonjs');
const builtins = require('rollup-plugin-node-builtins');
const replace = require('rollup-plugin-replace');
const preprocess = require('rollup-plugin-preprocess').default;

const pkg = require(path.resolve('./package'));
const input = 'src/index.js';

const { prod, bundle } = minimist(process.argv.slice(2), {
    boolean: ['prod', 'bundle'],
    default: {
        prod: false,
        bundle: false,
    },
    alias: {
        p: 'prod',
        b: 'bundle',
    },
});

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
            'pixi-gl-core': ['GLFramebuffer'], // TODO: remove pixi-gl-core
        },
    }),
    string({
        include: [
            'src/**/*.frag',
            'src/**/*.vert',
        ],
    }),
    replace({
        __VERSION__: pkg.version,
    }),
    preprocess({
        context: {
            DEV: !prod,
            DEVELOPMENT: !prod,
            PROD: prod,
            PRODUCTION: prod,
        },
    }),
    buble(),
    thaw(),
];

if (prod)
{
    plugins.push(uglify({
        mangle: true,
        compress: true,
        output: {
            comments(node, comment)
            {
                const { value, type } = comment;

                return type === 'comment2' && value.indexOf(pkg.name) > -1;
            },
        },
    }, minify));
}

const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
const external = Object.keys(pkg.dependencies || []);
const sourcemap = true;
const name = 'PIXI';
const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * Compiled ${compiled}
 *
 * ${pkg.name} is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */\n`;

exports.default = [
    {
        banner,
        name,
        input,
        output: {
            file: pkg.main,
            format: bundle ? 'umd' : 'cjs',
        },
        external,
        sourcemap,
        plugins,
    },
    {
        banner,
        input,
        output: {
            file: pkg.module,
            format: 'es',
        },
        external,
        sourcemap,
        plugins,
    },
];

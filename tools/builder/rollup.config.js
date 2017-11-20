import path from 'path';
import thaw from './thaw';
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
    transpile(),
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

                return type === 'comment2' && value.indexOf(` * ${pkg.name} `) > -1;
            },
        },
    }, minify));
}

const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
const external = Object.keys(pkg.dependencies || []);
const sourcemap = true;
const treeshake = !bundle;
const name = 'PIXI';
const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * Compiled ${compiled}
 *
 * ${pkg.name} is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */\n`;

export default [
    {
        banner,
        name,
        input,
        treeshake,
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
        treeshake,
        output: {
            file: pkg.module,
            format: 'es',
        },
        external,
        sourcemap,
        plugins,
    },
];

const path = require('path');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const string = require('rollup-plugin-string');
const uglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const minimist = require('minimist');
const commonjs = require('rollup-plugin-commonjs');
const builtins = require('rollup-plugin-node-builtins');
const replace = require('rollup-plugin-replace');
const preprocess = require('rollup-plugin-preprocess').default;

const pkg = require(path.resolve('./package'));
const input = 'src/index.js';

const { prod, format, output } = minimist(process.argv.slice(2), {
    string: ['format', 'output'],
    boolean: ['prod'],
    default: {
        format: 'es',
        prod: false,
        output: '',
    },
    alias: {
        f: 'format',
        p: 'prod',
        o: 'output',
    },
});

// Allow overriding output, but default to "module" and "main" fields
const file = output || (format === 'es' ? pkg.module : pkg.main);

const plugins = [
    resolve({
        browser: true,
        preferBuiltins: true,
    }),
    builtins(),
    commonjs({
        namedExports: {
            'resource-loader': ['Resource'],
            'pixi-gl-core': ['GLFramebuffer'],
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
    // This workaround plugin removes Object.freeze usage with Rollup
    // because there is no way to disable and we need it to
    // properly add deprecated methods/classes on namespaces
    // such as PIXI.utils or PIXI.loaders, code was borrowed
    // from 'rollup-plugin-es3'
    // TODO: Removes this when opt-out option for Rollup is available
    {
        name: 'thaw',
        transformBundle: function(code) {
            code = code.replace(/Object.freeze\s*\(\s*([^)]*)\)/g, '$1');
            return { code, map: { mappings: '' } };
        },
    },
];

if (prod)
{
    let first = true;

    plugins.push(uglify({
        mangle: true,
        compress: true,
        output: {
            comments(node, comment)
            {
                const { value, type } = comment;

                if (type === 'comment2' && first)
                {
                    first = false;

                    return value[0] === '!';
                }

                return false;
            },
        },
    }, minify));
}

const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');

const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * Compiled ${compiled}
 *
 * pixi-filters is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */\n`;

module.exports = {
    banner,
    name: 'PIXI',
    input,
    output: {
        file,
        format,
    },
    external: Object.keys(pkg.dependencies || []),
    sourcemap: true,
    plugins,
};

import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "../package.json";

const plugins = [
    commonjs(),
    resolve(),
    typescript()
];

// Disabling minification makes faster
// watch and better coverage debugging
if (process.env.NODE_ENV === "production") {
    plugins.push(terser({
        output: {
            comments(node, comment) {
                return comment.line === 1;
            },
        },
        compress: {
            drop_console: true,
        },
    }));
}

const sourcemap = true;
const external = Object.keys(pkg.peerDependencies);
const compiled = (new Date()).toUTCString().replace(/GMT/g, "UTC");
const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * https://github.com/pixijs/gif
 * Compiled ${compiled}
 *
 * ${pkg.name} is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */`;

/**
 * This configuration is designed for building the browser version
 * of the library, ideally included using the <script> element
 */
export default [
    {
        input: pkg.source,
        external,
        plugins,
        output: [
            {
                banner,
                freeze: false,
                sourcemap,
                format: "cjs",
                file: pkg.main,
            },
            {
                banner,
                freeze: false,
                sourcemap,
                format: "esm",
                file: pkg.module,
            },
        ],
    },
    {
        input: pkg.source,
        external,
        plugins,
        output: {
            banner,
            freeze: false,
            format: "iife",
            name: pkg.namespace,
            sourcemap,
            file: pkg.bundle,
            globals: {
                "@pixi/loaders": "PIXI",
                "@pixi/core": "PIXI",
                "@pixi/ticker": "PIXI",
                "@pixi/settings": "PIXI",
                "@pixi/sprite": "PIXI",
                "@pixi/constants": "PIXI",
            },
        }
    }
];
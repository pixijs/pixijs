/* eslint-disable no-console */
/**
 * -----------------------------------------------------------------
 * Type declaration compatibility checks.
 *
 * PixiJS is built with TypeScript 6, which declares the WebGPU types in its own
 * lib.dom, so the shipped declarations carry no `@webgpu/types` reference.
 * Consumers still on TypeScript 5 get a `.legacy.d.ts` wrapper for each typed
 * entry point (`pixi.js`, `pixi.js/gif`, `pixi.js/html-source`) that adds the
 * reference back. Getting any of them wrong is invisible to the unit and visual
 * suites - it only shows up in a consuming project - so this compiles a small
 * fixture per entry point against TypeScript 5, 6 and 7.
 *
 * The fixtures resolve `pixi.js` through a symlink into node_modules, so the
 * package `exports` map (and its `types@<6.0` conditions) is exercised the way
 * a real consumer would hit it, rather than by pointing at a file path.
 * -----------------------------------------------------------------
 */

import { readJSONSync } from 'fs-extra/esm';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawn } from '../utils/spawn.mts';

const root = process.cwd();

/** A TypeScript version to check the declarations against */
interface Compiler
{
    /** Label used in the output */
    name: string;
    /** A release to install on the side; unset means the repo's own compiler */
    version?: string;
    /** Compiler options only this version understands */
    options?: Record<string, unknown>;
}

/**
 * The other releases are installed into directories of their own rather than as devDependencies:
 * every one names its binary `tsc`, so having them side by side leaves node_modules/.bin/tsc
 * pointing at whichever npm linked last - which would silently build and type check the whole
 * repo with the wrong compiler.
 *
 * They are invoked by path, not through `npx -p typescript@5.9.3 tsc`: npx will hand back the
 * locally installed compiler instead of the one asked for, so that route can silently run the
 * check against the wrong version.
 */
const ts6: Compiler = {
    name: 'ts6',
    // node10 resolution is deprecated in TypeScript 6, but consumers still run it
    options: { ignoreDeprecations: '6.0' },
};
const ts5: Compiler = { name: 'ts5', version: '5.9.3' };
const ts7: Compiler = { name: 'ts7', version: '7.0.2' };

/**
 * Where a compiler's package is installed
 * @param compiler - The compiler to locate
 */
function compilerDir(compiler: Compiler): string
{
    return compiler.version ? path.join(os.tmpdir(), `pixi-tsc-${compiler.version}`) : root;
}

/**
 * The `tsc` script to run for a compiler
 * @param compiler - The compiler to locate
 */
function tscPath(compiler: Compiler): string
{
    return path.join(compilerDir(compiler), 'node_modules/typescript/bin/tsc');
}

/**
 * Install a pinned release, and check it is the version that was asked for
 * @param compiler - The compiler to install
 */
async function ensureTypescript(compiler: Compiler)
{
    const { version } = compiler;
    const dir = compilerDir(compiler);

    if (!fs.existsSync(tscPath(compiler)))
    {
        console.log(`installing typescript@${version} to check the declarations against...`);
        fs.mkdirSync(dir, { recursive: true });
        await spawn('npm', ['install', '--prefix', dir, `typescript@${version}`, '--no-save', '--silent']);
    }

    const installed = readJSONSync(path.join(dir, 'node_modules/typescript/package.json')).version;

    if (installed !== version)
    {
        throw new Error(`expected typescript@${version} in ${dir}, found ${installed}`);
    }
}

/** Build the declarations if they are not there yet - the fixtures compile against real output */
async function ensureLib()
{
    // the last wrapper fixTypes writes, so a lib from before the subpath wrappers is rebuilt too
    if (fs.existsSync(path.join(root, 'lib/html-source/init.legacy.d.ts'))) return;

    console.log('lib declarations missing, building them first...');
    await spawn('node', ['./scripts/build.mts', '--lib', '--dev']);
}

/**
 * A module resolution mode to check the declarations under. Which entry point a consumer
 * ends up with depends on this: `bundler` and `node16` go through the `exports` map and its
 * `types@<6.0` condition, while `node10` goes through the root `types` field and
 * `typesVersions`. Both routes have to land on the right declarations.
 *
 * `node16` is deliberately not covered: pixi's CommonJS declarations import `earcut`, which is
 * ESM only, so it reports TS1479 there on every compiler with or without this change.
 */
interface Resolution
{
    /** Label used in the output */
    name: string;
    /** The `moduleResolution` and matching `module` values */
    moduleResolution: string;
    module: string;
    /** The compilers that still offer this mode */
    compilers: Compiler[];
}

const bundler: Resolution = { name: 'bundler', moduleResolution: 'bundler', module: 'esnext', compilers: [ts6, ts5, ts7] };
// TypeScript 7 removed node10 resolution outright
const node10: Resolution = { name: 'node10', moduleResolution: 'node10', module: 'commonjs', compilers: [ts6, ts5] };

/**
 * A consumer program to compile against the declarations. Each typed `exports` entry carries
 * its own `types@<6.0` condition, and a `@webgpu/types` reference pulled in by one entry
 * covers the whole program, so every entry gets a program that imports nothing else.
 */
interface Entry
{
    /** Label used in the output */
    name: string;
    /** The program, one line per element */
    source: string[];
    /** Resolution modes it is checked under */
    resolutions: Resolution[];
}

const entries: Entry[] = [
    {
        name: 'root',
        source: [
            `import type { ICanvas, Renderer, Texture } from 'pixi.js';`,
            ``,
            `export const renderer: Renderer | null = null;`,
            `export const texture: Texture | null = null;`,
            ``,
            `// the overloads both canvases must keep satisfying for ICanvas`,
            `export const canvas: ICanvas = document.createElement('canvas');`,
            `export const offscreen: ICanvas = new OffscreenCanvas(1, 1);`,
            `export const context = canvas.getContext('webgpu');`,
            ``,
        ],
        resolutions: [bundler, node10],
    },
    // node10 ignores `exports`, so the subpaths only resolve through the bundler route
    {
        name: 'gif',
        source: [
            `import type { GifSource } from 'pixi.js/gif';`,
            ``,
            `export const source: GifSource | null = null;`,
            ``,
        ],
        resolutions: [bundler],
    },
    {
        name: 'html-source',
        source: [
            `import type { HTMLSource } from 'pixi.js/html-source';`,
            ``,
            `export const source: HTMLSource | null = null;`,
            ``,
        ],
        resolutions: [bundler],
    },
];

/** One fixture to compile: an entry point, under a resolution mode, with a compiler */
interface Case
{
    entry: Entry;
    resolution: Resolution;
    compiler: Compiler;
}

const cases: Case[] = entries.flatMap((entry) =>
    entry.resolutions.flatMap((resolution) =>
        resolution.compilers.map((compiler) => ({ entry, resolution, compiler }))));

/**
 * Write a throwaway consumer project for one case, next to the shared `pixi.js` symlink.
 * @param parent - The directory holding every fixture and the symlink
 * @param c - The case to write
 * @returns The project's tsconfig.json
 */
function writeFixture(parent: string, c: Case): string
{
    const { entry, resolution, compiler } = c;
    const dir = path.join(parent, `${entry.name}-${resolution.name}-${compiler.name}`);
    const tsconfig = path.join(dir, 'tsconfig.json');

    fs.mkdirSync(dir);
    fs.writeFileSync(tsconfig, JSON.stringify({
        compilerOptions: {
            target: 'es2020',
            module: resolution.module,
            moduleResolution: resolution.moduleResolution,
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            ...compiler.options,
        },
        files: ['use.ts'],
    }, null, 2));
    fs.writeFileSync(path.join(dir, 'use.ts'), entry.source.join('\n'));

    return tsconfig;
}

/** The main entry must not drag in the globals TypeScript 6 already declares */
function checkMainEntryIsClean()
{
    const contents = fs.readFileSync(path.join(root, 'lib/index.d.ts'), 'utf8');

    if (contents.includes('@webgpu/types'))
    {
        throw new Error(
            'lib/index.d.ts references @webgpu/types - that conflicts with the WebGPU types '
            + 'built into TypeScript 6. The reference belongs in the .legacy.d.ts wrappers only.'
        );
    }
}

async function main()
{
    await ensureLib();
    await Promise.all([ts5, ts7].map(ensureTypescript));
    checkMainEntryIsClean();

    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'pixi-types-'));
    const failures: string[] = [];

    fs.mkdirSync(path.join(parent, 'node_modules'));
    fs.symlinkSync(root, path.join(parent, 'node_modules/pixi.js'), 'dir');

    try
    {
        for (const c of cases)
        {
            const label = `dts:${c.entry.name} / ${c.resolution.name} / ${c.compiler.name}`;

            try
            {
                await spawn('node', [tscPath(c.compiler), '-p', writeFixture(parent, c)]);
                console.log(`  ${label}  \x1b[32m✓\x1b[0m`);
            }
            catch
            {
                console.log(`  ${label}  \x1b[31m✗\x1b[0m`);
                failures.push(label);
            }
        }
    }
    finally
    {
        fs.rmSync(parent, { recursive: true, force: true });
    }

    if (failures.length)
    {
        throw new Error(`Declarations do not compile with: ${failures.join(', ')}`);
    }
}

main().catch((err) =>
{
    console.error(err.message);
    process.exit(1);
});

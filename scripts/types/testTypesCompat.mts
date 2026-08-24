/* eslint-disable no-console */
/**
 * -----------------------------------------------------------------
 * Type declaration compatibility checks.
 *
 * PixiJS is built with TypeScript 6, which declares the WebGPU types in its own
 * lib.dom, so `lib/index.d.ts` carries no `@webgpu/types` reference. Consumers
 * still on TypeScript 5 get `lib/index.legacy.d.ts`, which adds that reference
 * back. Getting either one wrong is invisible to the unit and visual suites -
 * it only shows up in a consuming project - so this compiles a small fixture
 * against both compilers.
 *
 * The fixture resolves `pixi.js` through a symlink into node_modules, so the
 * package `exports` map (and its `types@>=6.0` condition) is exercised the way a
 * real consumer would hit it, rather than by pointing at a file path.
 * -----------------------------------------------------------------
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawn } from '../utils/spawn.mts';

/** The TypeScript 5 release the legacy declarations are checked against */
const ts5Version = '5.9.3';

/** A TypeScript version to check the declarations against */
interface Compiler
{
    /** Label used in the output */
    name: string;
    /** Command to run, and its leading arguments */
    command: [string, ...string[]];
    /** Compiler options only this version understands */
    options?: Record<string, unknown>;
}

/** Where the pinned TypeScript 5 install lives, kept out of the repo's own node_modules */
const ts5Dir = path.join(os.tmpdir(), `pixi-tsc-${ts5Version}`);
const ts5Bin = path.join(ts5Dir, 'node_modules/typescript/bin/tsc');

/**
 * TypeScript 5 is installed into a directory of its own rather than as a devDependency: both
 * packages name their binary `tsc`, so having them side by side leaves node_modules/.bin/tsc
 * pointing at whichever npm linked last - which would silently build and type check the whole
 * repo with the wrong compiler.
 *
 * It is invoked by path, not through `npx -p typescript@5.9.3 tsc`: npx will hand back the
 * locally installed compiler instead of the one asked for, so that route can silently run the
 * check against the wrong version.
 */
const compilers: Compiler[] = [
    {
        name: 'dts:ts6',
        command: ['node', 'node_modules/typescript/bin/tsc'],
        // node10 resolution is deprecated in TypeScript 6, but consumers still run it
        options: { ignoreDeprecations: '6.0' },
    },
    { name: 'dts:ts5', command: ['node', ts5Bin] },
];

/** Install the pinned TypeScript 5 compiler, and check it is the version that was asked for */
async function ensureTs5()
{
    if (!fs.existsSync(ts5Bin))
    {
        console.log(`installing typescript@${ts5Version} to check the legacy declarations...`);
        fs.mkdirSync(ts5Dir, { recursive: true });
        await spawn('npm', ['install', '--prefix', ts5Dir, `typescript@${ts5Version}`, '--no-save', '--silent']);
    }

    const { version } = JSON.parse(
        fs.readFileSync(path.join(ts5Dir, 'node_modules/typescript/package.json'), 'utf8')
    );

    if (version !== ts5Version)
    {
        throw new Error(`expected typescript@${ts5Version} in ${ts5Dir}, found ${version}`);
    }
}

const root = process.cwd();

/** Build the declarations if they are not there yet - the fixture compiles against real output */
async function ensureLib()
{
    if (fs.existsSync(path.join(root, 'lib/index.legacy.d.ts'))) return;

    console.log('lib declarations missing, building them first...');
    await spawn('node', ['./scripts/build.mts', '--lib', '--dev']);
}

/**
 * A module resolution mode to check the declarations under. Which entry point a consumer
 * ends up with depends on this: `bundler` and `node16` go through the `exports` map and its
 * `types@>=6.0` condition, while `node10` goes through the root `types` field and
 * `typesVersions`. Both routes have to land on the right declarations.
 *
 * `node16` is deliberately not covered: pixi's CommonJS declarations import `earcut`, which is
 * ESM only, so it reports TS1479 there on both compilers with or without this change.
 */
interface Resolution
{
    /** Label used in the output */
    name: string;
    /** The `moduleResolution` and matching `module` values */
    moduleResolution: string;
    module: string;
}

const resolutions: Resolution[] = [
    { name: 'bundler', moduleResolution: 'bundler', module: 'esnext' },
    { name: 'node10', moduleResolution: 'node10', module: 'commonjs' },
];

/**
 * Create a throwaway consumer project that imports pixi.js.
 * @param resolution - The module resolution mode the fixture should compile under
 * @param compiler - The compiler it will be handed to, for version-specific options
 * @returns The directory the fixture was written to
 */
function writeFixture(resolution: Resolution, compiler: Compiler): string
{
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixi-types-'));

    fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
    fs.symlinkSync(root, path.join(dir, 'node_modules/pixi.js'), 'dir');

    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({
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

    fs.writeFileSync(path.join(dir, 'use.ts'), [
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
    ].join('\n'));

    return dir;
}

/** The main entry must not drag in the globals TypeScript 6 already declares */
function checkMainEntryIsClean()
{
    const contents = fs.readFileSync(path.join(root, 'lib/index.d.ts'), 'utf8');

    if (contents.includes('@webgpu/types'))
    {
        throw new Error(
            'lib/index.d.ts references @webgpu/types - that conflicts with the WebGPU types '
            + 'built into TypeScript 6. The reference belongs in lib/index.legacy.d.ts only.'
        );
    }
}

async function main()
{
    await ensureLib();
    await ensureTs5();
    checkMainEntryIsClean();

    const failures: string[] = [];

    for (const resolution of resolutions)
    {
        for (const compiler of compilers)
        {
            const label = `${compiler.name} / ${resolution.name}`;
            const fixture = writeFixture(resolution, compiler);

            try
            {
                await spawn(
                    compiler.command[0],
                    [...compiler.command.slice(1), '-p', path.join(fixture, 'tsconfig.json')]
                );
                console.log(`  ${label}  \x1b[32m✓\x1b[0m`);
            }
            catch
            {
                console.log(`  ${label}  \x1b[31m✗\x1b[0m`);
                failures.push(label);
            }

            fs.rmSync(fixture, { recursive: true, force: true });
        }
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

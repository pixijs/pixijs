/* eslint-disable no-console */
/**
 * -----------------------------------------------------------------
 * Type declaration compatibility checks.
 *
 * PixiJS ships two entry points for its declarations: `lib/index.legacy.d.ts`
 * pulls in `@webgpu/types` for TypeScript 5, and `lib/index.ts6.d.ts` relies on
 * the WebGPU types built into TypeScript 6's own lib.dom. Getting either one
 * wrong is invisible to the unit and visual suites - it only shows up in a
 * consuming project - so this compiles a small fixture against both compilers.
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

/** The TypeScript 6 release the declarations are checked against */
const ts6Version = '6.0.3';

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

/**
 * TypeScript 6 is fetched through npx rather than installed as a devDependency: both packages
 * name their binary `tsc`, so having them side by side leaves node_modules/.bin/tsc pointing at
 * whichever npm linked last - which would silently build and type check the whole repo with the
 * wrong compiler.
 */
const compilers: Compiler[] = [
    { name: 'dts:ts5', command: ['node', 'node_modules/typescript/bin/tsc'] },
    {
        name: 'dts:ts6',
        command: ['npx', '-y', '-p', `typescript@${ts6Version}`, 'tsc'],
        // node10 resolution is deprecated in TypeScript 6, but consumers still run it
        options: { ignoreDeprecations: '6.0' },
    },
];

const root = process.cwd();

/** Build the declarations if they are not there yet - the fixture compiles against real output */
async function ensureLib()
{
    if (fs.existsSync(path.join(root, 'lib/index.ts6.d.ts'))) return;

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
        `import type { Renderer, Texture } from 'pixi.js';`,
        ``,
        `export const renderer: Renderer | null = null;`,
        `export const texture: Texture | null = null;`,
        ``,
        `// the overload that HTMLCanvasElement must keep satisfying for ICanvas`,
        `export const context = document.createElement('canvas').getContext('webgpu');`,
        ``,
    ].join('\n'));

    return dir;
}

/** The TypeScript 6 entry must not drag in the globals TypeScript 6 already declares */
function checkTs6EntryIsClean()
{
    const contents = fs.readFileSync(path.join(root, 'lib/index.ts6.d.ts'), 'utf8');

    if (contents.includes('@webgpu/types'))
    {
        throw new Error(
            'lib/index.ts6.d.ts references @webgpu/types - that conflicts with the WebGPU types '
            + 'built into TypeScript 6. The reference belongs in lib/index.legacy.d.ts only.'
        );
    }
}

async function main()
{
    await ensureLib();
    checkTs6EntryIsClean();

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

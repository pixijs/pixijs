/**
 * -----------------------------------------------------------------
 * The file is used to fix various issues with the types
 * - Add reference paths to the mixins
 * - Copy over the Shaders.d.ts file to the lib folder for
 *   proper frag,vert,wgsl support
 * -----------------------------------------------------------------
 */

import glob from 'glob';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Get every d.ts file in the src folder and add a
 * reference path to it in the lib/index.d.ts file
 *
 * This allows us to define our PixiMixins in the src folder
 * e.g. /// <reference path="./app/ApplicationMixins.d.ts" />
 */
function addMixinReferencePaths()
{
    // Support windows paths, glob requires only forward slashes
    const srcPath = path.join(process.cwd(), 'src').replace(/\\/g, '/');
    const files = glob.sync(`${srcPath}/**/*.d.ts`);
    const lines: string[] = [];

    files.forEach((file) =>
    {
        const name = file.split(srcPath)[1];

        lines.push(`/// <reference path=".${name}" />`);
    });

    const filePath = path.join(process.cwd(), './lib/index.d.ts');
    const contents = fs.readFileSync(filePath, 'utf8');
    const updatedContents = `${lines.join('\n')}\n${contents}`;

    fs.writeFileSync(filePath, updatedContents);
}

/** Copy the Shaders.d.ts file to the lib folder This is needed for proper frag,vert,wgsl support in the types */
function copyShaders()
{
    const src = path.join(process.cwd(), './types');
    const lib = path.join(process.cwd(), './lib');

    fs.copyFileSync(`${src}/Shaders.d.ts`, `${lib}/Shaders.d.ts`);

    // add this to the index.d.ts file
    const filePath = path.join(process.cwd(), './lib/index.d.ts');
    const contents = fs.readFileSync(filePath, 'utf8');

    if (!contents.includes('/// <reference path="./Shaders.d.ts" />'))
    {
        const updatedContents = `/// <reference path="./Shaders.d.ts" />\n${contents}`;

        fs.writeFileSync(filePath, updatedContents);
    }
}

/**
 * Ship the WebGPU declarations both TypeScript versions need.
 *
 * The library is built with TypeScript 6, which declares the WebGPU types in
 * its own lib.dom, so `lib/index.d.ts` is the modern entry point and carries
 * only the canvas overloads TypeScript 6 is missing (see WebGPUCanvas.d.ts).
 *
 * TypeScript 5 has no WebGPU types at all, so it gets a wrapper entry that
 * pulls in `@webgpu/types` on top - the overloads it declares are identical to
 * the ones in WebGPUCanvas.d.ts, so the two merge without conflict.
 *
 * package.json points TypeScript 5 at `lib/index.legacy.d.ts` through the
 * `types@<6.0` export condition and the `typesVersions` field; TypeScript 6 and
 * above get `lib/index.d.ts`, the default.
 */
function writeVersionedEntries()
{
    const src = path.join(process.cwd(), './types');
    const lib = path.join(process.cwd(), './lib');

    fs.copyFileSync(`${src}/WebGPUCanvas.d.ts`, `${lib}/WebGPUCanvas.d.ts`);

    const filePath = `${lib}/index.d.ts`;
    const contents = fs.readFileSync(filePath, 'utf8');

    if (!contents.includes('/// <reference path="./WebGPUCanvas.d.ts" />'))
    {
        fs.writeFileSync(filePath, `/// <reference path="./WebGPUCanvas.d.ts" />\n${contents}`);
    }

    fs.writeFileSync(
        `${lib}/index.legacy.d.ts`,
        '/// <reference types="@webgpu/types" />\nexport * from \'./index\';\n'
    );
}

addMixinReferencePaths();
copyShaders();
writeVersionedEntries();

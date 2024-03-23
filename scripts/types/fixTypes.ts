/**
 * -----------------------------------------------------------------
 * The file is used to fix various issues with the types
 * - Add reference paths to the mixins
 * - Copy over the Shaders.d.ts file to the lib folder for
 *   proper frag,vert,wgsl support
 * -----------------------------------------------------------------
 */

import * as glob from 'glob';
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
    const globPath = `${path.join(process.cwd(), './src')}/**/*.d.ts`;
    const files = glob.sync(globPath);

    const lines: string[] = [];

    files.forEach((file) =>
    {
        const name = file.split(`${process.cwd()}/src`)[1];

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

addMixinReferencePaths();
copyShaders();

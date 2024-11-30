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
    const srcPath = path.resolve(__dirname, '../../src');
    const globPath = `${srcPath.replace(/\\/g, '/')}/**/*.d.ts`;
    const files = glob.sync(globPath);

    // eslint-disable-next-line no-console
    console.log('Adding reference paths to mixins:', globPath, files);

    const lines: string[] = [];

    files.forEach((file) =>
    {
        const name = file.split(srcPath)[1];

        // eslint-disable-next-line no-console
        console.log('Adding reference path:', `/// <reference path=".${name}" />`);

        lines.push(`/// <reference path=".${name}" />`);
    });

    const filePath = path.resolve(__dirname, '../../lib/index.d.ts');
    const contents = fs.readFileSync(filePath, 'utf8');
    const updatedContents = `${lines.join('\n')}\n${contents}`;

    fs.writeFileSync(filePath, updatedContents);
}

/** Copy the Shaders.d.ts file to the lib folder This is needed for proper frag,vert,wgsl support in the types */
function copyShaders()
{
    const src = path.resolve(__dirname, '../../types');
    const lib = path.resolve(__dirname, '../../lib');

    fs.copyFileSync(path.join(src, 'Shaders.d.ts'), path.join(lib, 'Shaders.d.ts'));

    // add this to the index.d.ts file
    const filePath = path.join(lib, 'index.d.ts');
    const contents = fs.readFileSync(filePath, 'utf8');

    if (!contents.includes('/// <reference path="./Shaders.d.ts" />'))
    {
        const updatedContents = `/// <reference path="./Shaders.d.ts" />\n${contents}`;

        fs.writeFileSync(filePath, updatedContents);
    }
}

addMixinReferencePaths();
copyShaders();

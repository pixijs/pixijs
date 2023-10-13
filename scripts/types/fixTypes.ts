/**
 * -------------------------------------------------------
 * Get every d.ts file in the src folder and add a
 * reference path to it in the lib/index.d.ts file
 *
 * This allows us to define our PixiMixins in the src folder
 *
 * e.g. /// <reference path="./app/ApplicationMixins.d.ts" />
 * -------------------------------------------------------
 */

import fs from 'fs';
import glob from 'glob';
import path from 'path';

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

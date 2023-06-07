/**
 * -------------------------------------------------------
 * Generates the index.ts files for the library with
 * all the exports defined
 *
 * We do this to avoid having to manually maintain the index.ts
 * files and reduce circular dependencies
 */

import fs from 'fs';
import glob from 'glob';
import path from 'path';

const directoryPath = path.join(process.cwd(), './src'); // Replace with your directory path
const indexFilePath = path.join(directoryPath, 'index.ts');

// Use glob to find all TypeScript files recursively in the directory
const files = glob.sync('**/*[!.d].ts', { cwd: directoryPath });

// Generate export statements for each file
const exportStatements = files.map((file) => `export * from './${file.replace(/\.ts$/, '')}';`);

// now grab all vert/frag shaders
const shaders = glob.sync('**/*.{vert,frag,glsl,wgsl}', { cwd: directoryPath });

// Generate export statements for each shader
const shaderExportStatements = shaders.map((file) =>
{
    const replace = file.replace(/\.(vert|frag|glsl|wgsl)$/, '');
    let shortName = path.basename(replace).replace(/-([a-z])/g, (_, group1) => group1.toUpperCase());
    const ext = path.extname(file).slice(1);

    shortName += ext.charAt(0).toUpperCase() + ext.slice(1);

    return `export { default as ${shortName} } from './${file}';`;
});

// Combine the export statements into one file
exportStatements.push(...shaderExportStatements);

// Write the export statements to the index.ts file
fs.writeFileSync(indexFilePath, exportStatements.join('\n'), { encoding: 'utf-8' });

import fs from 'fs';
import glob from 'glob';
import path from 'path';

const directoryPath = path.join(process.cwd(), './src');

// find all directories in src
const directories = glob.sync('*/', { cwd: directoryPath, absolute: true });

// Use glob to find all TypeScript files recursively in the directory
directories.forEach((directory) =>
{
    const files = glob.sync('**/!(*.d).ts', {
        cwd: directory,
        ignore: [
            '**/init.ts',
            // for bundles this is not needed, and for normal build it gets added by the browser extension
            '**/browserAll.ts',
            // same as above
            '**/webworkerAll.ts',
            // these shouldn't be exported as the webworker plugin will handle them
            '**/*.worker.ts',
            // Ignore circular imports
            '**/index.ts',
            // Tests
            '**/__tests__/**'
        ],
    });

    // Generate export statements for each file
    const lines = [
        '// Auto-generated code, do not edit manually',
        ...files.map((file) => `export * from './${file.replace(/\.ts$/, '')}';`)
    ];

    // now grab all vert/frag shaders
    const shaders = glob.sync('**/*.{vert,frag,glsl,wgsl}', { cwd: directory });

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
    lines.push(...shaderExportStatements, '');

    // Write the export statements to the index.ts file
    const filePath = path.join(directory, 'index.ts');

    const localFile = path.relative(process.cwd(), filePath);
    const command = process.argv[2];
    const output = lines.join('\n');
    const changed = fs.readFileSync(filePath, 'utf-8') !== output;

    if (command === '--check')
    {
        if (changed)
        {
            console.error(`ERROR: File ${localFile} is out of date, run 'npm run build:index' to update it.\n`);
            process.exit(1);
        }
    }
    else if (command === '--write')
    {
        if (changed)
        {
            // eslint-disable-next-line no-console
            console.log(`Updating ${localFile}`);
            fs.writeFileSync(filePath, output, 'utf-8');
        }
    }
    else
    {
        console.error(`ERROR: Invalid command. Use '--check' or '--write'.`);
        process.exit(1);
    }
});

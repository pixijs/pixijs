import path from 'path';
import { readJSON, writeJSON } from './utils/json';
import { spawn } from './utils/spawn';

/** This script publishes the package as `pixi.js` and `pixijs` */
async function main(): Promise<void>
{
    let originalPackage: {name: string};
    // Save the paths to package.json
    const packagePath = path.join(process.cwd(), 'package.json');

    try
    {
        // Read the original package.json
        originalPackage = await readJSON<{name: string}>(packagePath);

        // Run npm publish
        await spawn('npm', ['publish']);

        // Update the name in package.json
        const updatedPackage = { ...originalPackage, name: 'pixi.js' };

        await writeJSON(packagePath, updatedPackage);

        // Run npm publish again
        await spawn('npm', ['publish']);
    }
    finally
    {
        // Restore the original package.json if it exists
        if (originalPackage)
        {
            await writeJSON(packagePath, originalPackage);
        }
    }
}

void main();

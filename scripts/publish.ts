import path from 'path';
import { readJSON, writeJSON } from './utils/json';
import { spawn } from './utils/spawn';

/** This script publishes the package as `pixi.js` and `pixijs` */
async function main(): Promise<void>
{
    try
    {
        // Save the paths to package.json and package-lock.json
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageLockPath = path.join(process.cwd(), 'package-lock.json');

        // Read the original package.json and package-lock.json
        const originalPackage = await readJSON<{name: string}>(packagePath);
        const originalPackageLock = await readJSON<{name: string}>(packageLockPath);

        // Run npm publish
        await spawn('npm', ['publish']);

        // Update the name in package.json and package-lock.json
        const updatedPackage = { ...originalPackage, name: 'pixijs' };
        // Update all instances of the package name in package-lock.json
        const updatedPackageLock = JSON.parse(JSON.stringify(originalPackageLock)
            .replace(new RegExp(originalPackage.name, 'g'), 'pixijs'));

        await writeJSON(packagePath, updatedPackage);
        await writeJSON(packageLockPath, updatedPackageLock);

        // Run npm publish again
        await spawn('npm', ['publish']);

        // Restore the original package.json and package-lock.json
        await writeJSON(packagePath, originalPackage);
        await writeJSON(packageLockPath, originalPackageLock);
    }
    catch (err)
    {
        console.error((err as Error).message);
        process.exit(1);
    }
}

void main();

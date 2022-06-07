import workspacesRun from 'workspaces-run';
import path from 'path';
import fs from 'fs';

/** simplified interface for a package.json */
interface SimplePackageJson
{
    location: string
    name: string
    dependencies: Record<string, string>
}

/**
 * Adds global reference to the start of a packages `index.d.ts` file
 * @param basePath
 * @param dataToWrite
 */
function writeToIndex(basePath: string, dataToWrite: string): void
{
    const indexDtsPath = path.resolve(basePath, './index.d.ts');
    const file = fs.readFileSync(indexDtsPath, { encoding: 'utf8' }).toString().split('\n');

    file.unshift(dataToWrite);
    fs.writeFileSync(indexDtsPath, file.join('\n'));
}

/**
 * Collect the list of packages in the project
 * @param result
 */
async function getPackages(result: SimplePackageJson[] = []): Promise<SimplePackageJson[]>
{
    await workspacesRun({ cwd: process.cwd() }, async (pkg) =>
    {
        result.push({
            location: pkg.dir,
            name: pkg.name,
            dependencies: pkg.config.dependencies,
        });
    });

    return result;
}

/**
 * This is a workaround for https://github.com/pixijs/pixi.js/issues/6993
 *
 * All this script does is inject a path reference into a packages `index.d.ts` if a `global.d.ts`
 * exists.
 */
async function start(): Promise<void>
{
    let pixiLocation: string;
    let pixiLegacyLocation: string;
    let pixiGlobalMixins = '';
    let pixiLegacyGlobalMixins = '';

    const packages = await getPackages();
    const legacyPackages = Object.keys(packages.find((pkg) => pkg.name === 'pixi.js-legacy').dependencies);
    const pixiPackages = Object.keys(packages.find((pkg) => pkg.name === 'pixi.js').dependencies);

    packages.forEach((pkg) =>
    {
        const basePath = path.relative(process.cwd(), pkg.location);

        if (pkg.name === 'pixi.js')
        {
            pixiLocation = pkg.location;

            return;
        }
        if (pkg.name === 'pixi.js-legacy')
        {
            pixiLegacyLocation = pkg.location;

            return;
        }

        const globalDtsPath = path.resolve(basePath, './global.d.ts');

        if (fs.existsSync(globalDtsPath))
        {
            const pixiTypeData = `/// <reference types="${pkg.name}" />\n`;
            const packageTypeData = `/// <reference path="./global.d.ts" />\n`;

            if (pixiPackages.includes(pkg.name))
            {
                pixiGlobalMixins += pixiTypeData;
            }
            else if (legacyPackages.includes(pkg.name))
            {
                pixiLegacyGlobalMixins += pixiTypeData;
            }

            writeToIndex(basePath, packageTypeData);
        }
    });

    // write the total types to the main packages
    let basePath = path.relative(process.cwd(), pixiLocation);

    writeToIndex(basePath, pixiGlobalMixins);
    basePath = path.relative(process.cwd(), pixiLegacyLocation);
    writeToIndex(basePath, pixiLegacyGlobalMixins);
}

start();

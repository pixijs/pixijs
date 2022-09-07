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
    const packages = await getPackages();
    const bundles = [
        'pixi.js',
        'pixi.js-legacy',
        '@pixi/node'
    ];
    const locations = Array(bundles.length).fill('');
    const mixins = Array(bundles.length).fill('');
    const pkgs = bundles.map((bundle) => Object.keys(packages.find((pkg) => pkg.name === bundle).dependencies));

    packages.forEach((pkg) =>
    {
        const basePath = path.relative(process.cwd(), pkg.location);

        if (bundles.includes(pkg.name))
        {
            locations[bundles.indexOf(pkg.name)] = pkg.location;
        }

        const globalDtsPath = path.resolve(basePath, './global.d.ts');

        if (fs.existsSync(globalDtsPath))
        {
            const pixiTypeData = `/// <reference types="${pkg.name}" />\n`;
            const packageTypeData = `/// <reference path="./global.d.ts" />\n`;

            pkgs.forEach((pixiPkgs, index) =>
            {
                if (pixiPkgs.includes(pkg.name))
                {
                    mixins[index] += pixiTypeData;
                }
            });

            writeToIndex(basePath, packageTypeData);
        }
    });

    locations.forEach((location, index) =>
    {
        const basePath = path.relative(process.cwd(), location);

        writeToIndex(basePath, mixins[index]);
    });
}

start();

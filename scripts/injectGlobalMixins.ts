import { getPackages } from '@lerna/project';
import batchPackages from '@lerna/batch-packages';
import filterPackages from '@lerna/filter-packages';
import path from 'path';
import fs from 'fs';

const legacyPackages = [
    '@pixi/canvas-display',
    '@pixi/canvas-extract',
    '@pixi/canvas-graphics',
    '@pixi/canvas-mesh',
    '@pixi/canvas-particles',
    '@pixi/canvas-prepare',
    '@pixi/canvas-renderer',
    '@pixi/canvas-sprite',
    '@pixi/canvas-sprite-tiling',
    '@pixi/canvas-text',
];

/**
 * simplified interface for a package.json
 */
interface SimplePackageJson
{
    location: string
    name: string
}

/**
 * Gets all the non-private packages package.json data
 */
async function getSortedPackages(): Promise<SimplePackageJson[]>
{
    const packages = await getPackages(process.cwd());

    const filtered = filterPackages(packages, undefined, undefined, false);

    return batchPackages(filtered)
        .reduce((arr: SimplePackageJson[], batch: SimplePackageJson[]) => arr.concat(batch), []);
}

/**
 * Adds global reference to the start of a packages `index.d.ts` file
 */
function writeToIndex(basePath: string, dataToWrite: string): void
{
    const indexDtsPath = path.resolve(basePath, './index.d.ts');
    const file = fs.readFileSync(indexDtsPath, { encoding: 'utf8' }).toString().split('\n');

    file.unshift(dataToWrite);
    fs.writeFileSync(indexDtsPath, file.join('\n'));
}

/**
 * This is a workaround for https://github.com/pixijs/pixi.js/issues/6993
 *
 * Loops through each package and checks if `global.d.ts` exists.
 * If it does then it appends the contents into `index.d.ts`
 *
 * Before appending it will replace `declare namespace GlobalMixin` with `declare global { namespace GlobalMixin`
 *
 * It also bundles each individual packages `global.d.ts` file and writes them to the main pixi.js
 * and pixi.js-legacy packages
 */
async function start(): Promise<void>
{
    let pixiLocation: string;
    let pixiLegacyLocation: string;
    let pixiGlobalMixins = '';
    let pixiLegacyGlobalMixins = '';

    const packages = await getSortedPackages();

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
            const pixiTypeData = `/// <reference path="../${pkg.name}/global.d.ts" />\n`;
            const packageTypeData = `/// <reference path="./global.d.ts" />\n`;

            if (!legacyPackages.includes(pkg.name))
            {
                pixiGlobalMixins += pixiTypeData;
            }
            else
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

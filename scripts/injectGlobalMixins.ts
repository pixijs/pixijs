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
 * we only care about `location` here
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
 * Appends some data to a packages `index.d.ts` file
 */
function writeToIndex(basePath: string, dataToWrite: string): void
{
    const indexDtsPath = path.resolve(basePath, './index.d.ts');

    fs.appendFileSync(indexDtsPath, dataToWrite);
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
            const globalDtsFile = fs.readFileSync(globalDtsPath, {
                encoding: 'utf8'
            });

            let pixiTypeData = `${globalDtsFile.replace('declare', '')}\n`;
            let packageTypeData = `${globalDtsFile.replace('declare', 'declare global {')}}`;

            // special case for canvas-renderer as it has `declare interface` inside the `global.d.ts`
            if (pkg.name === '@pixi/canvas-renderer')
            {
                packageTypeData = `${globalDtsFile.replace('declare', 'declare global {')}}`
                    .replace('declare interface', '} declare interface').slice(0, -1);

                const split =  `${globalDtsFile.replace('declare', '')}}`.split('declare interface');

                pixiTypeData = split.shift();
                pixiLegacyGlobalMixins
                    = `declare interface ${split.join('declare interface ').slice(0, -1)}${pixiLegacyGlobalMixins}`;
            }

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

    writeToIndex(basePath, `${pixiGlobalMixins.replace('namespace', 'declare global {\n namespace')}}`);
    basePath = path.relative(process.cwd(), pixiLegacyLocation);
    writeToIndex(basePath, `${pixiLegacyGlobalMixins.replace('namespace', 'declare global {\n namespace')}}`);
}

start();

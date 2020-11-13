import { getPackages } from '@lerna/project';
import batchPackages from '@lerna/batch-packages';
import filterPackages from '@lerna/filter-packages';
import path from 'path';
import fs from 'fs';

/**
 * simplified interface for a package.json
 * we only care about `location` here
 */
interface SimplePackageJson
{
    location: string
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
 * This is a workaround for https://github.com/pixijs/pixi.js/issues/6993
 *
 * Loops through each package and checks if `global.d.ts` exists.
 * If it does then it appends the contents into `index.d.ts`
 *
 * Before appending it will replace `declare namespace GlobalMixin` with `declare global { namespace GlobalMixin`
 */
async function start(): Promise<void>
{
    const packages = await getSortedPackages();

    packages.forEach((pkg) =>
    {
        const basePath = path.relative(process.cwd(), pkg.location);

        const globalDtsPath = path.resolve(basePath, './global.d.ts');

        if (fs.existsSync(globalDtsPath))
        {
            const indexDtsPath = path.resolve(basePath, './index.d.ts');
            const globalDtsFile = fs.readFileSync(globalDtsPath, {
                encoding: 'utf8'
            });

            const wrapper = `${globalDtsFile.replace('declare', 'declare global {')}}`;

            fs.appendFileSync(indexDtsPath, wrapper);
        }
    });
}

start();

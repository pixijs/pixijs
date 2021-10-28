import workspacesRun from 'workspaces-run';
import path from 'path';
import fs from 'fs';
import util from 'util';

/** Basic package.json structure */
interface PackageConfig
{
    version: string;
    name: string;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
}

/** Simplified interface for a package.json */
interface Package
{
    name: string;
    dir: string;
    config: PackageConfig;
}

// Create utils for writing JSON file
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const writeJson = (file: string, data: unknown) => writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
const readJson = (file: string) => readFile(file, 'utf8').then((data) => JSON.parse(data));

/**
 * The goal of this script is to sync the peer versions to exact. Lerna does
 * not take care of this when we do a version bump.
 */
async function main(): Promise<void>
{
    const cwd = process.cwd();
    const versions: Record<string, string> = {};
    const packages: Package[] = [];
    const pathToPackages: Record<string, { pkg: Package, entry: PackageConfig }> = {};
    const lockFile = path.join(cwd, 'package-lock.json');
    const lock = await readJson(lockFile);

    // Get all the packages and create a map of versions
    await workspacesRun({ cwd }, async (pkg) =>
    {
        versions[pkg.name] = pkg.config.version;

        const relativePath = path.relative(cwd, pkg.dir);

        if (relativePath in lock.packages)
        {
            pathToPackages[relativePath] = { pkg, entry: lock.packages[relativePath] };
        }
        packages.push(pkg);
    });

    // Update the peer dependencies in packages
    // because Lerna doesn't do this for us
    for (const p of packages)
    {
        const { peerDependencies: peers } = p.config;

        if (peers)
        {
            for (const n in peers)
            {
                if (n in versions)
                {
                    peers[n] = versions[n];
                }
            }

            await writeJson(path.join(p.dir, 'package.json'), p.config);
        }
    }

    // `lerna version` doesn't update package-lock.json for npm 7
    // so we disable Lerna auto-tagging/pushing and do it ourself
    // See https://github.com/lerna/lerna/issues/2891
    for (const relativePath in pathToPackages)
    {
        const { pkg, entry } = pathToPackages[relativePath];

        entry.version = pkg.config.version;
        entry.dependencies = pkg.config?.dependencies;
        entry.devDependencies = pkg.config?.devDependencies;
        entry.peerDependencies = pkg.config?.peerDependencies;
    }

    // Update the packages' requires field in lock file
    Object.keys(lock.dependencies)
        .filter((name) => !!versions[name])
        .map((name) => lock.dependencies[name].requires)
        .forEach((requires: Record<string, string>) =>
        {
            for (const n in requires)
            {
                if (n in versions)
                {
                    requires[n] = versions[n];
                }
            }
        });

    await writeJson(lockFile, lock);
}

main();

import { getPackages } from '@lerna/project';
import path from 'path';
import fs from 'fs';
import util from 'util';

/**
 * Simplified interface for a package.json
 */
interface Package
{
    location: string;
    name: string;
    version: string;
    peerDependencies: Record<string, string>;
    toJSON(): { peerDependencies: Record<string, string> };
}

// Create utils for writing JSON file
const writeFile = util.promisify(fs.writeFile);
const writeJson = (file: string, data: unknown) => writeFile(file, `${JSON.stringify(data, null, 2)}\n`);

/**
 * The goal of this script is to sync the peer versions to exact. Lerna does
 * not take care of this when we do a version bump.
 */
async function main(): Promise<void>
{
    const packages = await getPackages(process.cwd()) as Package[];
    const packagesHavePeers = packages.filter((p) => !!p.peerDependencies);

    // We are using exact version now, but this
    // will insulate us if we decide to not do this
    // and use fuzzy versioning again.
    const versions = packages.reduce(
        (list, pkg) => ({ ...list, [pkg.name]: pkg.version }),
        {} as Record<string, string>
    );

    for (const p of packagesHavePeers)
    {
        const json = p.toJSON();
        const peers = json.peerDependencies;

        for (const n in peers)
        {
            if (n in versions)
            {
                peers[n] = versions[n];
            }
        }

        await writeJson(path.join(p.location, 'package.json'), json);
    }
}

main();

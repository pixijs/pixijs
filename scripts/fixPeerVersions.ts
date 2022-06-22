import workspacesRun from 'workspaces-run';
import path from 'path';
import fs from 'fs';
import util from 'util';

/** Simplified interface for a package.json */
interface Package
{
    name: string;
    dir: string;
    config: {
        version: string;
        peerDependencies?: Record<string, string>;
    }
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
    const versions: Record<string, string> = {};
    const packagesWithPeers: Package[] = [];

    await workspacesRun({ cwd: process.cwd() }, async (pkg) =>
    {
        versions[pkg.name] = pkg.config.version;

        if (pkg.config.peerDependencies)
        {
            packagesWithPeers.push(pkg);
        }
    });

    for (const p of packagesWithPeers)
    {
        const json = p.config;
        const peers = json.peerDependencies;

        for (const n in peers)
        {
            if (n in versions)
            {
                peers[n] = versions[n];
            }
        }

        await writeJson(path.join(p.dir, 'package.json'), json);
    }
}

main();

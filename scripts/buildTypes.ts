import path from 'path';
import { promises } from 'fs';
// import copyfiles from 'copyfiles';

async function start(): Promise<void>
{
    const outDir = path.resolve(__dirname, '..', 'out');
    const bundlesDir = path.join(outDir, 'bundles');
    const packagesDir = path.join(outDir, 'packages');

    const bundles = (await promises.readdir(bundlesDir)).map((bundle) => path.join(bundlesDir, bundle));
    const packages = (await promises.readdir(packagesDir)).map((pkg) => path.join(packagesDir, pkg));
    const all = [...packages, ...bundles];

    for (const dir of all)
    {
        const libDir = path.join(dir, 'lib');
        await promises.rename(path.join(dir, 'src'), libDir);
    }

    // await copyfiles([outDir], )
}

start();
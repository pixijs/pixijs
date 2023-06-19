import { promises } from 'fs';
import path from 'path';

async function main(): Promise<void>
{
    const rootDir = path.resolve(__dirname, '..');
    const outDir = path.join(rootDir, 'out');
    const bundlesDir = path.join(outDir, 'bundles');
    const packagesDir = path.join(outDir, 'packages');
    const globalMixinsPattern = /(reference) types="packages\/[^\/]+\/(global)"/;
    const all = [
        ...(await promises.readdir(packagesDir)).map((pkg) => path.join(packagesDir, pkg)),
        ...(await promises.readdir(bundlesDir)).map((bundle) => path.join(bundlesDir, bundle))
    ];

    for (const dir of all)
    {
        // Rename src to lib
        const libDir = path.join(dir, 'lib');

        await promises.rename(path.join(dir, 'src'), libDir);

        // Fix-up the global.d.ts reference
        const buffer = await promises.readFile(path.join(libDir, 'index.d.ts'), 'utf8');

        await promises.writeFile(
            path.join(libDir, 'index.d.ts'),
            buffer.replace(globalMixinsPattern, '$1 path="../$2.d.ts"')
        );
    }
}

main();

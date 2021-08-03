import path from 'path';
import fs from 'fs';
import { getPackages } from '@lerna/project';

interface PackageResult {
    name: string;
    location: string;
    tests: string;
    available: boolean;
}

async function main()
{
    const packages: PackageResult[] = (await getPackages(path.dirname(__dirname))).map((pkg) =>
    {
        const tests = path.join(pkg.location, 'test');
        const available = fs.existsSync(tests);

        return {
            name: pkg.name,
            location: pkg.location,
            tests,
            available,
        };
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(packages, null, '  '));
}

main();

export type { PackageResult };

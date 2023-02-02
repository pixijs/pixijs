import { execSync } from 'child_process';
import path from 'path';
import { bump } from './utils/bump';
import { readJSON } from './utils/json';
import { spawn } from './utils/spawn';

/**
 * Bump the version of all packages in the monorepo
 * and their dependencies. Replacement for lerna version --exact --force-publish
 */
async function main(): Promise<void>
{
    const status = execSync('git status --porcelain', {
        encoding: 'utf8',
        cwd: process.cwd(),
    });

    if (status.length > 0)
    {
        console.error('Error: You have uncommitted changes. Commit or stash them first.');

        process.exit(1);
    }

    try
    {
        const { version } = await readJSON<{version: string}>(
            path.join(process.cwd(), 'package.json')
        );

        // Finish up: update lock, commit and tag the release
        await spawn('npm', ['version', await bump(version)]);

        // For testing purposes
        if (!process.argv.includes('--no-push'))
        {
            await spawn('git', ['push']);
            await spawn('git', ['push', '--tags']);
        }
    }
    catch (err)
    {
        // eslint-disable-next-line no-console
        console.error((err as Error).message);

        process.exit(1);
    }
}

main();

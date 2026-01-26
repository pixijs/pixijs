import { readJSON } from 'fs-extra';
import path from 'path';
import { bump } from './utils/bump';
import { spawn } from './utils/spawn';

/**
 * Bump the version of all packages in the monorepo
 * and their dependencies. Replacement for lerna version --exact --force-publish
 */
async function main(): Promise<void>
{
    try
    {
        const { version } = await readJSON(
            path.join(process.cwd(), 'package.json')
        );
        const nextVersion = await bump(version);

        // Finish up: update lock, commit and tag the release
        await spawn('npm', ['version', nextVersion, '-m', `v${nextVersion}`]);

        // For testing purposes
        if (!process.argv.includes('--no-push'))
        {
            await spawn('git', ['push']);
            await spawn('git', ['push', '--tags']);
        }
    }
    catch (err)
    {
        console.error((err as Error).message);

        process.exit(1);
    }
}

void main();

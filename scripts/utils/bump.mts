import semver from 'semver';
import { confirm, input, select } from '@inquirer/prompts';

type BumpType = 'major' | 'minor' | 'patch' | 'prerelease' | 'custom';

/**
 * Ask the user to do a version bump.
 * @param currentVersion - Current version to change from.
 * @returns The next version.
 */
export const bump = async (currentVersion: string): Promise<string> =>
{
    const bumpType = await select<BumpType>({
        message: `Release version (currently v${currentVersion}):`,
        choices: [
            { value: 'prerelease', name: `Prerelease (v${semver.inc(currentVersion, 'prerelease')})` },
            { value: 'patch', name: `Patch (v${semver.inc(currentVersion, 'patch')})` },
            { value: 'minor', name: `Minor (v${semver.inc(currentVersion, 'minor')})` },
            { value: 'major', name: `Major (v${semver.inc(currentVersion, 'major')})` },
            { value: 'custom', name: `Custom version` },
        ],
    });

    let nextVersion: string | null;

    if (bumpType === 'custom')
    {
        const custom = await input({
            message: 'What version? (e.g., 1.0.0)',
        });

        nextVersion = custom;
    }
    else
    {
        nextVersion = semver.inc(currentVersion, bumpType);
    }

    const confirmed = await confirm({
        message: `Are you sure you want to release v${nextVersion}?`,
        default: false,
    });

    if (!confirmed)
    {
        throw new Error(`Version bump cancelled.`);
    }

    // Make sure the version is valid
    if (nextVersion === null || semver.valid(nextVersion) === null)
    {
        throw new Error(`Error: Invalid version: ${nextVersion}`);
    }

    // Make sure we are incrementing the version
    if (semver.lte(nextVersion, currentVersion))
    {
        throw new Error(`Error: Next version (v${nextVersion}) is less than current version (v${currentVersion}).`);
    }

    return nextVersion;
};

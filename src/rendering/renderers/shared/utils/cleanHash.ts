import type { Renderer } from '../../..';

/**
 * Takes a hash and removes all the falsy values from it.
 * In PixiJS, we tend to null properties instead of using 'delete' for performance reasons.
 * However, in some cases, this could be a problem if the hash grows too large over time,
 * this function can be used to clean a hash.
 * @param hash - The hash to clean.
 * @returns A new hash with all the falsy values removed.
 */
export function cleanHash<T>(hash: Record<string, T>): Record<string, T>
{
    let clean = false;

    for (const i in hash)
    {
        if (!hash[i])
        {
            clean = true;
            break;
        }
    }

    if (!clean) return hash;

    const cleanHash = Object.create(null);

    for (const i in hash)
    {
        const value = hash[i];

        if (value)
        {
            cleanHash[i] = value;
        }
    }

    return cleanHash;
}

/**
 * A helper function that schedules the cleaning of a hash on an object.
 * @param renderer - The renderer this System works for.
 * @param owner - The owner of the hash.
 * @param hashName - the name of the hash on the owner
 * @param frequency - The frequency to clean the hash (defaults to 2 mins)
 */
export function scheduleCleanHash(renderer: Renderer, owner: any, hashName: string, frequency = 120000): void
{
    renderer.scheduler.repeat(() =>
    {
        owner[hashName] = cleanHash(owner[hashName]);
    }, frequency);
}


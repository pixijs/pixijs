/**
 * We are trying to enable strictNullChecks in PixiJS. However, enabling strictNullChecks directly
 * generates a lot of errors, so we decided to do it step by step. This script filters the output
 * of tsc with a specific prefix in the path. Once we try to enable strict null checks for a
 * package, its path should be added to the `pathPrefix` array below.
 *
 * You can run this script using `npm run types:strict`.
 * @see https://github.com/pixijs/pixijs/issues/8852
 * @see https://github.com/pixijs/pixijs/pull/8965
 */

const pathPrefixs = [
    'packages/color/',
    'packages/utils/',
];
const filter = new RegExp(pathPrefixs.length === 0 ? `$^` : `^(${pathPrefixs.join('|')})`);

const errorRegex = /^(.+)\(\d+,\d+\): (error|warning) TS\d+:/;

const stdin = process.openStdin();
let buffer = '';

stdin.on('data', (chunk) => { buffer += chunk; });
stdin.on('end', () =>
{
    const lines = buffer.split('\n');
    const errors: string[][] = [];
    let currentError: string[] | null = null;

    for (const line of lines)
    {
        const match = line.match(errorRegex);

        if (!match)
        {
            currentError?.push(line);
            continue;
        }
        if (currentError) errors.push(currentError);
        currentError = [line];
    }
    if (currentError) errors.push(currentError);

    const matchedErrors = errors
        .map((error) => error.join('\n'))
        .filter((error) => error.match(filter));

    if (matchedErrors.length !== 0)
    {
        console.error(matchedErrors.join('\n'));
        process.exitCode = 1;
    }
});

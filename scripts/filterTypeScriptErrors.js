const pathPrefixs = [
    'packages/utils',
];
const filter = new RegExp(pathPrefixs.length === 0 ? `$^` : `^(${pathPrefixs.join('|')})`);

const errorRegex = /^(.+)\(\d+,\d+\): (error|warning) TS\d+:/;

const stdin = process.openStdin();
let buffer = '';

stdin.on('data', (chunk) => { buffer += chunk; });
stdin.on('end', () =>
{
    const lines = buffer.split('\n');
    const errors = [];
    let currentError = null;

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

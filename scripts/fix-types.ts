import fs from 'fs';
import path from 'path';

const prepend = `/// <reference path="./global.d.ts" />`;

// Patch global.d.ts into the api-extractor output
// because api doesn't support exporting global definitions (ambient types)
(async () =>
{
    const typesFile = path.resolve(__dirname, '../index.d.ts');
    const buffer = await fs.promises.readFile(typesFile, 'utf8');

    if (!buffer.startsWith(prepend))
    {
        await fs.promises.writeFile(typesFile, `${prepend}\n${buffer}`);
        // eslint-disable-next-line no-console
        console.log('Patched types.');
    }
    else
    {
        // eslint-disable-next-line no-console
        console.log('Types already patched.');
    }
})();

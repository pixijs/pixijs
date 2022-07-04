import { exec } from 'child_process';
import path from 'path';

// eslint-disable-next-line func-names
module.exports = async function ()
{
    if (!process.env.GITHUB_ACTIONS)
    {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        globalThis.__SERVER__ = exec(`http-server -c-1 ${path.join(process.cwd(), './packages')}`);
    }

    await new Promise((resolve) =>
    {
        // give the server time to start
        setTimeout(resolve, 1000);
    });
};

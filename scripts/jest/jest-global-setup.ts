import { spawn } from 'child_process';
import { join } from 'path';

// eslint-disable-next-line func-names
module.exports = async function ()
{
    if (!process.env.GITHUB_ACTIONS)
    {
        const httpServerProcess = spawn(
            'http-server',
            ['-c-1', `${join(process.cwd(), './')}`],
            {
                // See https://nodejs.org/api/child_process.html#spawning-bat-and-cmd-files-on-windows
                shell: process.platform === 'win32',
            },
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        globalThis.__SERVER__ = httpServerProcess;

        // give the server time to start
        await new Promise<void>((resolve) =>
        {
            let data = '';

            httpServerProcess.stdout.on('data', (chunk) =>
            {
                data += chunk;
                if (data.includes('Hit CTRL-C to stop the server'))
                {
                    resolve();
                }
            });
        });
    }
};

import { spawn } from 'child_process';
import { join } from 'path';

// eslint-disable-next-line func-names
export default async function ()
{
    if (!process.env.GITHUB_ACTIONS)
    {
        const httpServerProcess = spawn(
            'http-server',
            [`${join(process.cwd(), './packages')}`, '-p', '8080', '-c-1'],
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
}

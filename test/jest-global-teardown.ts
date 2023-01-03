import kill from 'tree-kill';

import type { ChildProcess } from 'child_process';

// eslint-disable-next-line func-names
module.exports = async function ()
{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const httpServerProcess = (globalThis.__SERVER__ as ChildProcess | undefined);

    if (httpServerProcess)
    {
        const processClose = new Promise<void>((resolve) =>
        {
            httpServerProcess.on('close', resolve);
        });

        kill(httpServerProcess.pid);
        await processClose;
    }
};

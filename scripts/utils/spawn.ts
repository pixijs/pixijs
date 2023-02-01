import childProcess from 'child_process';

/**
 * Utility to do spawn but as a Promise
 * @param command
 * @param args
 * @param options
 */
export const spawn = (command: string, args: string[], options: childProcess.SpawnOptions = {}) =>
    new Promise<void>((resolve, reject) =>
    {
        const child = childProcess.spawn(command, args, {
            stdio: 'inherit',
            cwd: process.cwd(),
            // See https://nodejs.org/api/child_process.html#spawning-bat-and-cmd-files-on-windows
            shell: process.platform.startsWith('win'),
            ...options,
        });

        child.on('close', async (code) =>
        {
            if (code === 0)
            {
                resolve();
            }
        });
        child.on('error', reject);
    });

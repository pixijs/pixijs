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
            shell: process.platform === 'win32',
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

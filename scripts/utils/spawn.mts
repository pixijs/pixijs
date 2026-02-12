import childProcess from 'child_process';
import path from 'path';

export const spawn = (command: string, args: string[], options: childProcess.SpawnOptions & { signal?: AbortSignal } = {}) =>
    new Promise<void>((resolve, reject) =>
    {
        const { signal, ...spawnOptions } = options;
        const binPath = path.resolve(process.cwd(), 'node_modules/.bin');
        const envPath = `${binPath}${path.delimiter}${process.env.PATH}`;

        const child = childProcess.spawn(command, args, {
            stdio: 'inherit',
            cwd: process.cwd(),
            shell: process.platform === 'win32',
            ...spawnOptions,
            env: { ...process.env, ...spawnOptions.env, PATH: envPath },
        });

        if (signal)
        {
            signal.addEventListener('abort', () =>
            {
                child.kill('SIGTERM');
            }, { once: true });
        }

        child.on('close', (code) =>
        {
            if (code === 0)
            {
                resolve();
            }
            else
            {
                reject(new Error(`"${command} ${args.join(' ')}" exited with code ${code}`));
            }
        });
        child.on('error', reject);
    });

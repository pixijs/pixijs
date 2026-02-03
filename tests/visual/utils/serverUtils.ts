import { spawn } from 'child_process';
import { createServer } from 'net';
import kill from 'tree-kill';

import type { ChildProcess } from 'child_process';

let serverProcess: ChildProcess | null = null;
let serverPort = 8080;

export function getServerPort(): number
{
    return serverPort;
}

async function getAvailablePort(): Promise<number>
{
    return new Promise((resolve) =>
    {
        const server = createServer();

        server.listen(0, '127.0.0.1', () =>
        {
            const { port } = server.address() as { port: number };

            server.close(() => resolve(port));
        });
    });
}

export async function startServer(): Promise<void>
{
    serverPort = await getAvailablePort();
    serverProcess = spawn(
        'http-server',
        ['-c-1', '-p', String(serverPort), process.cwd()],
        {
            shell: process.platform === 'win32',
        },
    );

    await new Promise<void>((resolve) =>
    {
        serverProcess.stdout.on('data', (chunk: Buffer) =>
        {
            if (chunk.toString().includes('Hit CTRL-C to stop the server'))
            {
                resolve();
            }
        });
    });
}

export async function stopServer(): Promise<void>
{
    if (serverProcess)
    {
        const processClose = new Promise<void>((resolve) =>
        {
            serverProcess.on('close', resolve);
        });

        kill(serverProcess.pid);
        await processClose;
        serverProcess = null;
    }
}

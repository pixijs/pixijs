import { spawn } from './utils/spawn.mts';

const flags = new Set(process.argv.slice(2));
const isLib = flags.has('--lib');
const isDev = flags.has('--dev');

const controller = new AbortController();
const { signal } = controller;

async function parallel(tasks: Promise<void>[])
{
    try
    {
        await Promise.all(tasks);
    }
    catch (err)
    {
        controller.abort();
        await Promise.allSettled(tasks);
        throw err;
    }
}

async function main()
{
    // Step 1: index + pkg in parallel (pkg skipped for lib-only without --dev)
    const step1: Promise<void>[] = [
        spawn('node', ['./scripts/index/index.mts', '--write'], { signal }),
    ];

    if (!isLib || isDev)
    {
        step1.push(spawn('node', ['./scripts/utils/exports.mts'], { signal }));
    }
    await parallel(step1);

    // Step 2: rollup (+ types chain for non-lib or dev mode)
    const rollupEnv = isLib ? { LIB_ONLY: '1' } : {};
    const rollup = spawn('rollup', ['-c', '.configs/rollup.config.mjs', '--failAfterWarnings'], {
        signal,
        env: rollupEnv,
    });

    const needsTypes = !isLib || isDev;

    if (!needsTypes)
    {
        await rollup;
    }
    else
    {
        const types = (async () =>
        {
            const tscCmd = isDev ? 'tsc-silent' : 'tsc';
            const tscArgs = isDev
                ? ['-p', '.configs/tsconfig.types.json', '--suppress', '@']
                : ['-p', '.configs/tsconfig.types.json'];

            await parallel([
                spawn(tscCmd, tscArgs, { signal }),
                spawn('copyfiles', ['-u', '1', 'src/**/*.d.ts', 'lib/'], { signal }),
            ]);
            await spawn('node', ['./scripts/types/fixTypes.mts'], { signal });

            if (!isDev)
            {
                await spawn('dts-bundle-generator', ['--config', '.configs/dts.config.js'], { signal });
            }
        })();

        await parallel([rollup, types]);
    }
}

main().catch((err) =>
{
    console.error(err.message);
    process.exit(1);
});

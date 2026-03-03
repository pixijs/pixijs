/* eslint-disable no-console */
import { spawn } from './utils/spawn.mts';

const argv = process.argv.slice(2);
const selectors = new Set(argv.filter((a) => !a.startsWith('-')));
const passthrough = argv.filter((a) => a.startsWith('-'));
const isDebug = selectors.has('debug');

selectors.delete('debug');

const all = selectors.size === 0;
const runLint = all || selectors.has('lint');
const runTypes = all || selectors.has('types');
const runIndex = all || selectors.has('index');
const runPrune = all || selectors.has('prune');
const runUnit = all || selectors.has('unit');
const runVisual = all || selectors.has('visual');

const hasStaticChecks = runLint || runTypes || runIndex || runPrune;
const hasJest = runUnit || runVisual;

type CheckResult = { name: string; passed: boolean; blocking: boolean };

async function runStaticChecks(): Promise<CheckResult[]>
{
    const checks: { name: string; blocking: boolean; fn: () => Promise<void> }[] = [];

    if (runLint)
    {
        checks.push({
            name: 'lint',
            blocking: true,
            fn: () => spawn('eslint', ['./', '--cache', '--max-warnings', '0', ...passthrough]),
        });
    }
    if (runTypes)
    {
        const tscConfigs = ['.configs/tsconfig.build.json', 'examples/tsconfig.json', 'playground/tsconfig.json'];

        for (const config of tscConfigs)
        {
            checks.push({
                name: `types:${config}`,
                blocking: true,
                fn: () => spawn('tsc', ['-p', config, '--noEmit', ...passthrough]),
            });
        }
    }
    if (runIndex)
    {
        checks.push({
            name: 'index',
            blocking: true,
            fn: () => spawn('node', ['./scripts/index/index.mts', '--check', ...passthrough]),
        });
    }
    if (runPrune)
    {
        checks.push({
            name: 'prune',
            blocking: false,
            fn: () =>
                spawn('knip', [
                    '--config',
                    '.configs/knip.jsonc',
                    '--exclude',
                    'enumMembers',
                    '--no-gitignore',
                    ...passthrough,
                ]),
        });
    }

    const results = await Promise.allSettled(checks.map((c) => c.fn()));

    return checks.map((c, i) => ({
        name: c.name,
        passed: results[i].status === 'fulfilled',
        blocking: c.blocking,
    }));
}

function printSummaryTable(results: CheckResult[])
{
    console.log('');
    const maxLen = Math.max(...results.map((r) => r.name.length));

    for (const r of results)
    {
        const icon = r.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';

        console.log(`  ${r.name.padEnd(maxLen)}  ${icon}`);
    }
    console.log('');
}

// Phase 1: static checks in parallel
let hasNonBlockingFailure = false;

if (hasStaticChecks)
{
    const results = await runStaticChecks();

    printSummaryTable(results);

    hasNonBlockingFailure = results.some((r) => !r.blocking && !r.passed);
    const blockingFailure = results.some((r) => r.blocking && !r.passed);

    if (blockingFailure)
    {
        if (hasJest) console.log('Jest tests skipped.');
        process.exit(1);
    }
}

// Phase 2: jest tests sequentially
const jestConfig = ['--config', '.configs/jest.config.js'];
const jestFlags = isDebug ? [] : ['--silent'];
const jestEnv = isDebug ? { DEBUG_MODE: '1' } : {};

try
{
    if (runUnit)
    {
        await spawn('jest', [...jestConfig, ...jestFlags, '--testPathIgnorePatterns=tests/visual', ...passthrough], {
            env: jestEnv,
        });
    }
    if (runVisual)
    {
        await spawn('jest', [...jestConfig, ...jestFlags, '--testPathPattern=tests/visual', ...passthrough], {
            env: jestEnv,
        });
    }
}
catch
{
    process.exit(1);
}

if (hasNonBlockingFailure) process.exit(1);

#!/usr/bin/env node
/**
 * Build status helper - writes build status to a file for the playground to read
 * Usage: node scripts/build-status.mjs start|done
 */
import { writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const statusFile = resolve(__dirname, '../.build-status.json');

const status = process.argv[2];

if (status === 'start')
{
    writeFileSync(statusFile, JSON.stringify({
        status: 'compiling',
        startedAt: Date.now()
    }));
}
else if (status === 'done')
{
    writeFileSync(statusFile, JSON.stringify({
        status: 'ready',
        completedAt: Date.now()
    }));
}
else
{
    console.error('Usage: node scripts/build-status.mjs <start|done>');
    process.exit(1);
}

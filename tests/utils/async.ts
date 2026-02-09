import { setTimeout } from 'node:timers/promises';

export function nextTick(): Promise<void>
{
    return setTimeout(0);
}


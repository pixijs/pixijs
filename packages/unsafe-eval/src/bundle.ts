import { install } from './install';

if (typeof (globalThis as any).PIXI === 'undefined')
{
    throw new Error('Global PIXI not found.');
}

install((globalThis as any).PIXI);

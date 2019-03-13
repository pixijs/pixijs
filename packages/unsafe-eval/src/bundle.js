import { install } from './install';

if (typeof window.PIXI === 'undefined')
{
    throw new Error('Global PIXI not found.');
}

install(window.PIXI);

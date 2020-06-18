import { install } from './install';

if (typeof (window as any).PIXI === 'undefined')
{
    throw new Error('Global PIXI not found.');
}

install((window as any).PIXI);

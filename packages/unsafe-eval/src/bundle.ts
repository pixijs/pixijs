import { install } from './install';

if (typeof (self as any).PIXI === 'undefined')
{
    throw new Error('Global PIXI not found.');
}

install((self as any).PIXI);

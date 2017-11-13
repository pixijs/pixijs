export * from './PIXI';
import * as PIXI from './PIXI';

if (typeof window !== 'undefined')
{
    window.PIXI = PIXI;
}

import deprecated from '@pixi/deprecated';
deprecated(PIXI);

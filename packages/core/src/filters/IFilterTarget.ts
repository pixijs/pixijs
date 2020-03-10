import type { Rectangle } from '@pixi/math';

export interface IFilterTarget
{
    filterArea: Rectangle;
    getBounds(skipUpdate?: boolean): Rectangle;
}

/**
 * Math classes and utilities mixed into PIXI namespace.
 *
 * @lends PIXI
 */

import { Circle } from './shapes/Circle';
import { Ellipse } from './shapes/Ellipse';
import { Polygon } from './shapes/Polygon';
import { Rectangle } from './shapes/Rectangle';
import { RoundedRectangle } from './shapes/RoundedRectangle';

export * from './IPoint';
export * from './Point';
export * from './ObservablePoint';
export * from './Matrix';
export * from './groupD8';
export * from './Transform';

export { Circle };
export { Ellipse };
export { Polygon };
export { Rectangle };
export { RoundedRectangle };

export * from './const';

/**
 * @description Complex shape type
 *
 */
export type IShape = Circle | Ellipse | Polygon | Rectangle | RoundedRectangle;

export interface ISize
{
    width: number;
    height: number;
}

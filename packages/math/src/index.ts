/// <reference path="../global.d.ts" />
/*
 * Math classes and utilities mixed into PIXI namespace.
 */

import { Circle } from './shapes/Circle';
import { Ellipse } from './shapes/Ellipse';
import { Polygon } from './shapes/Polygon';
import { Rectangle } from './shapes/Rectangle';
import { RoundedRectangle } from './shapes/RoundedRectangle';

export * from './groupD8';
export * from './IPoint';
export * from './IPointData';
export * from './Matrix';
export * from './ObservablePoint';
export * from './Point';
export * from './Transform';

export { Circle };
export { Ellipse };
export { Polygon };
export { Rectangle };
export { RoundedRectangle };

export * from './const';

/**
 * Complex shape type
 * @memberof PIXI
 */
export type IShape = Circle | Ellipse | Polygon | Rectangle | RoundedRectangle;

/**
 * @memberof PIXI
 */
export interface ISize
{
    width: number;
    height: number;
}

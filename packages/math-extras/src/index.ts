import './Point';
import './Rectangle';

import { IPointData, Point } from '@pixi/math';

export function floatEqual(a: number, b: number): boolean;
export function floatEqual(a: number, b: number, epsilon: number): boolean;
export function floatEqual(a: number, b: number, epsilon: number = Number.EPSILON): boolean
{
    if (a === b)
    {
        return true;
    }

    const diff = Math.abs(a - b);

    return diff < epsilon;
}

export function lineIntersection(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData): Point;
export function lineIntersection
<T extends IPointData>(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData, outPoint: T): T;
export function lineIntersection
<T extends IPointData>(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData, outPoint?: T): T
{
    if (!outPoint)
    {
        (outPoint as any) = new Point();
    }

    const denominator = (((bEnd.y - bStart.y) * (aEnd.x - aStart.x)) - ((bEnd.x - bStart.x) * (aEnd.y - aStart.y)));

    // If lines are parallel the intersection is in the infinite.
    if (denominator === 0)
    {
        outPoint.x = Infinity;
        outPoint.y = Infinity;

        return outPoint;
    }

    // ua is the factor of line a where the intersection occurs. ub is the factor of line b where the intersection occurs.
    const ua = (((bEnd.x - bStart.x) * (aStart.y - bStart.y)) - ((bEnd.y - bStart.y) * (aStart.x - bStart.x))) / denominator;
    const ub = (((aEnd.x - aStart.x) * (aStart.y - bStart.y)) - ((aEnd.y - aStart.y) * (aStart.x - bStart.x))) / denominator;

    // If the intersection is outside the segments is up to the user to detect that.
    // if (ua < 0 || ua > 1 || ub < 0 || ub > 1)
    // {
    //     return ???;
    // }

    outPoint.x = aStart.x + (ua * (aEnd.x - aStart.x));
    outPoint.y = bStart.y + (ub * (bEnd.y - bStart.y));

    return outPoint;
}

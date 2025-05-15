import { Point } from '../../../maths/point/Point';
import { matrixPool } from '../bounds/utils/matrixAndBoundsPool';

import type { PointData } from '../../../maths/point/PointData';
import type { Container } from '../Container';

export interface ToLocalGlobalMixin
{
    /**
     * Returns the global position of the container.
     * @param {Point} point - The optional point to write the global value to.
     * @param {boolean} skipUpdate - Should we skip the update transform.
     * @returns - The updated point.
     */
    getGlobalPosition(point?: Point, skipUpdate?: boolean): Point;
    /**
     * Calculates the global position of the container.
     * @param {PointData} position - The world origin to calculate from.
     * @param {P} point - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} skipUpdate - Should we skip the update transform.
     * @returns - A point object representing the position of this object.
     */
    toGlobal<P extends PointData = Point>(position: PointData, point?: P, skipUpdate?: boolean): P;
    /**
     * Calculates the local position of the container relative to another point.
     * @param {PointData} position - The world origin to calculate from.
     * @param {Container} from - The Container to calculate the global position from.
     * @param {P} point - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} skipUpdate - Should we skip the update transform
     * @returns - A point object representing the position of this object
     */
    toLocal<P extends PointData = Point>(position: PointData, from?: Container, point?: P, skipUpdate?: boolean): P;
}

export const toLocalGlobalMixin: Partial<Container> = {
    getGlobalPosition(point: Point = new Point(), skipUpdate = false): Point
    {
        if (this.parent)
        {
            this.parent.toGlobal(this._position, point, skipUpdate);
        }
        else
        {
            point.x = this._position.x;
            point.y = this._position.y;
        }

        return point;
    },

    toGlobal<P extends PointData = Point>(position: PointData, point?: P, skipUpdate = false): P
    {
        const globalMatrix = this.getGlobalTransform(matrixPool.get(), skipUpdate);

        // simply apply the matrix..
        point = globalMatrix.apply(position, point);

        matrixPool.return(globalMatrix);

        return point;
    },

    toLocal<P extends PointData = Point>(position: PointData, from?: Container, point?: P, skipUpdate?: boolean): P
    {
        if (from)
        {
            position = from.toGlobal(position, point, skipUpdate);
        }

        const globalMatrix = this.getGlobalTransform(matrixPool.get(), skipUpdate);

        // simply apply the matrix..
        point = globalMatrix.applyInverse(position, point);

        matrixPool.return(globalMatrix);

        return point;
    }
} as Container;

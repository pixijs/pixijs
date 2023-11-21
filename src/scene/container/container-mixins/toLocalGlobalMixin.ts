import { Matrix } from '../../../maths/matrix/Matrix';
import { Point } from '../../../maths/point/Point';
import { updateTransformBackwards } from '../bounds/getGlobalBounds';
import { updateLocalTransform } from '../utils/updateLocalTransform';

import type { PointData } from '../../../maths/point/PointData';
import type { Container } from '../Container';

export interface ToLocalGlobalMixin
{
    getGlobalPosition(point?: Point, skipUpdate?: boolean): Point;
    toGlobal<P extends PointData = Point>(position: PointData, point?: P, skipUpdate?: boolean): P;
    toLocal<P extends PointData = Point>(position: PointData, from?: Container, point?: P, skipUpdate?: boolean): P;
}

export const toLocalGlobalMixin: Partial<Container> = {
    /**
     * Returns the global position of the container.
     * @param point - The optional point to write the global value to.
     * @param skipUpdate - Should we skip the update transform.
     * @returns - The updated point.
     * @memberof scene.Container#
     */
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

    /**
     * Calculates the global position of the container.
     * @param position - The world origin to calculate from.
     * @param point - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param skipUpdate - Should we skip the update transform.
     * @returns - A point object representing the position of this object.
     * @memberof scene.Container#
     */
    toGlobal<P extends PointData = Point>(position: PointData, point?: P, skipUpdate = false): P
    {
        if (!skipUpdate)
        {
            if (this.didChange)
            {
                updateLocalTransform(this.localTransform, this);
            }

            const globalMatrix = updateTransformBackwards(this, new Matrix());

            globalMatrix.append(this.localTransform);

            return globalMatrix.apply<P>(position, point);
        }

        // simply apply the matrix..
        return this.worldTransform.apply<P>(position, point);
    },

    /**
     * Calculates the local position of the container relative to another point.
     * @param position - The world origin to calculate from.
     * @param from - The Container to calculate the global position from.
     * @param point - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param skipUpdate - Should we skip the update transform
     * @returns - A point object representing the position of this object
     * @memberof scene.Container#
     */
    toLocal<P extends PointData = Point>(position: PointData, from?: Container, point?: P, skipUpdate?: boolean): P
    {
        if (from)
        {
            position = from.toGlobal(position, point, skipUpdate);
        }

        if (!skipUpdate)
        {
            if (this.didChange)
            {
                updateLocalTransform(this.localTransform, this);
            }

            const globalMatrix = updateTransformBackwards(this, new Matrix());

            globalMatrix.append(this.localTransform);

            return globalMatrix.applyInverse<P>(position, point);
        }

        // simply apply the matrix..
        return this.worldTransform.applyInverse<P>(position, point);
    }
} as Container;

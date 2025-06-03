import { Point } from '../../../maths/point/Point';
import { matrixPool } from '../bounds/utils/matrixAndBoundsPool';

import type { PointData } from '../../../maths/point/PointData';
import type { Container } from '../Container';

/**
 * Interface for a mixin that provides methods to convert between local and global coordinates.
 * This mixin allows you to get the global position of a container,
 * convert a point from local to global coordinates,
 * and convert a point from global to local coordinates.
 *
 * It includes methods to optimize performance by using cached matrices when available.
 * @category scene
 * @advanced
 */
export interface ToLocalGlobalMixin
{
    /**
     * Returns the global position of the container, taking into account the container hierarchy.
     * @example
     * ```ts
     * // Basic position check
     * const globalPos = sprite.getGlobalPosition();
     * console.log(`Global: (${globalPos.x}, ${globalPos.y})`);
     *
     * // Reuse point object
     * const point = new Point();
     * sprite.getGlobalPosition(point);
     *
     * // Skip transform update for performance
     * const fastPos = container.getGlobalPosition(undefined, true);
     * ```
     * @param {Point} point - The optional point to write the global value to
     * @param {boolean} skipUpdate - Should we skip the update transform
     * @returns The updated point
     * @see {@link Container#toGlobal} For converting specific points
     * @see {@link Container#toLocal} For converting to local space
     */
    getGlobalPosition(point?: Point, skipUpdate?: boolean): Point;
    /**
     * Calculates the global position of a point relative to this container.
     * Takes into account the container hierarchy and transforms.
     * @example
     * ```ts
     * // Basic point conversion
     * const localPoint = { x: 10, y: 20 };
     * const globalPoint = container.toGlobal(localPoint);
     *
     * // With point reuse
     * const reusePoint = new Point();
     * container.toGlobal(localPoint, reusePoint);
     *
     * // Performance optimization
     * const fastPoint = container.toGlobal(
     *     { x: 50, y: 50 },
     *     undefined,
     *     true // Skip transform update
     * );
     * ```
     * @param {PointData} position - The local point to convert
     * @param {P} point - Optional point to store the result
     * @param {boolean} skipUpdate - Whether to skip transform updates
     * @returns The global position
     * @see {@link Container#toLocal} For reverse conversion
     * @see {@link Container#getGlobalPosition} For container position
     */
    toGlobal<P extends PointData = Point>(position: PointData, point?: P, skipUpdate?: boolean): P;
    /**
     * Calculates the local position of the container relative to another point.
     * Converts coordinates from any coordinate space to this container's local coordinate space.
     * @example
     * ```ts
     * // Basic coordinate conversion
     * const worldPoint = { x: 100, y: 100 };
     * const localPos = container.toLocal(worldPoint);
     *
     * // Convert from another container
     * const fromSprite = new Sprite(texture);
     * fromSprite.position.set(50, 50);
     * const pointInSprite = { x: 10, y: 10 };
     * const localPoint = container.toLocal(pointInSprite, fromSprite);
     *
     * // With point reuse for performance
     * const reusePoint = new Point();
     * container.toLocal(worldPoint, undefined, reusePoint);
     *
     * // Skip transform update for static objects
     * const fastLocal = container.toLocal(
     *     worldPoint,
     *     undefined,
     *     undefined,
     *     true
     * );
     * ```
     * @param {PointData} position - The world origin to calculate from
     * @param {Container} from - The Container to calculate the global position from
     * @param {P} point - A Point object in which to store the value
     * @param {boolean} skipUpdate - Should we skip the update transform
     * @returns A point object representing the position in local space
     * @see {@link Container#toGlobal} For reverse conversion
     * @see {@link Container#getGlobalPosition} For container position
     */
    toLocal<P extends PointData = Point>(position: PointData, from?: Container, point?: P, skipUpdate?: boolean): P;
}

/** @internal */
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

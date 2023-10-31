import type { PointData } from './PointData';

/**
 * Common interface for points. Both Point and ObservablePoint implement it
 * @memberof maths
 */
export interface PointLike extends PointData
{
    /**
     * Copies x and y from the given point
     * @param {PointData} p - The point to copy from
     * @returns {this} Returns itself.
     */
    copyFrom: (p: PointData) => this;
    /**
     * Copies x and y into the given point
     * @param {PointLike} p - The point to copy.
     * @returns {PointLike} Given point with values updated
     */
    copyTo: <T extends PointLike>(p: T) => T;
    /**
     * Returns true if the given point is equal to this point
     * @param {PointData} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     */
    equals: (p: PointData) => boolean;
    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     */
    set: (x?: number, y?: number) => void;
}


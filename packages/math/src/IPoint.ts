export interface IPoint
{
    x: number;
    y: number;
    copyFrom(p: IPoint): this;
    copyTo<T extends IPoint>(p: T): T;
    equals(p: IPoint): boolean;
    set(x?: number, y?: number): void;
}
/**
 * Common interface for points. Both Point and ObservablePoint implement it
 * @memberof PIXI
 * @interface IPoint
 */

/**
 * X coord
 * @memberof PIXI.IPoint#
 * @member {number} x
 */

/**
 * Y coord
 * @memberof PIXI.IPoint#
 * @member {number} y
 */

/**
 * Sets the point to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @method set
 * @memberof PIXI.IPoint#
 * @param {number} [x=0] - position of the point on the x axis
 * @param {number} [y=x] - position of the point on the y axis
 */

/**
 * Copies x and y from the given point
 * @method copyFrom
 * @memberof PIXI.IPoint#
 * @param {PIXI.IPoint} p - The point to copy from
 * @returns {this} Returns itself.
 */

/**
 * Copies x and y into the given point
 * @method copyTo
 * @memberof PIXI.IPoint#
 * @param {PIXI.IPoint} p - The point to copy.
 * @returns {PIXI.IPoint} Given point with values updated
 */

/**
 * Returns true if the given point is equal to this point
 *
 * @method equals
 * @memberof PIXI.IPoint#
 * @param {PIXI.IPoint} p - The point to check
 * @returns {boolean} Whether the given point equal to this point
 */


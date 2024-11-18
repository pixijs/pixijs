import { Rectangle } from './Rectangle';

import type { ShapePrimitive } from './ShapePrimitive';

/**
 * The Ellipse object is used to help draw graphics and can also be used to specify a hit area for containers.
 * ```js
 * import { Ellipse } from 'pixi.js';
 *
 * const ellipse = new Ellipse(0, 0, 20, 10); // 40x20 rectangle
 * const isPointInEllipse = ellipse.contains(0, 0); // true
 * ```
 * @memberof maths
 */
export class Ellipse implements ShapePrimitive
{
    /**
     * The X coordinate of the center of this ellipse
     * @default 0
     */
    public x: number;

    /**
     * The Y coordinate of the center of this ellipse
     * @default 0
     */
    public y: number;

    /**
     * The half width of this ellipse
     * @default 0
     */
    public halfWidth: number;

    /**
     * The half height of this ellipse
     * @default 0
     */
    public halfHeight: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @default 'ellipse'
     */
    public readonly type = 'ellipse';

    /**
     * @param x - The X coordinate of the center of this ellipse
     * @param y - The Y coordinate of the center of this ellipse
     * @param halfWidth - The half width of this ellipse
     * @param halfHeight - The half height of this ellipse
     */
    constructor(x = 0, y = 0, halfWidth = 0, halfHeight = 0)
    {
        this.x = x;
        this.y = y;
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }

    /**
     * Creates a clone of this Ellipse instance
     * @returns {Ellipse} A copy of the ellipse
     */
    public clone(): Ellipse
    {
        return new Ellipse(this.x, this.y, this.halfWidth, this.halfHeight);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this ellipse
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @returns Whether the x/y coords are within this ellipse
     */
    public contains(x: number, y: number): boolean
    {
        if (this.halfWidth <= 0 || this.halfHeight <= 0)
        {
            return false;
        }

        // normalize the coords to an ellipse with center 0,0
        let normx = ((x - this.x) / this.halfWidth);
        let normy = ((y - this.y) / this.halfHeight);

        normx *= normx;
        normy *= normy;

        return (normx + normy <= 1);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this ellipse including stroke
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @param strokeWidth - The width of the line to check
     * @param alignment - The alignment of the stroke
     * @returns Whether the x/y coords are within this ellipse
     */
    public strokeContains(x: number, y: number, strokeWidth: number, alignment: number = 0.5): boolean
    {
        const { halfWidth, halfHeight } = this;

        if (halfWidth <= 0 || halfHeight <= 0)
        {
            return false;
        }

        const strokeOuterWidth = strokeWidth * (1 - alignment);
        const strokeInnerWidth = strokeWidth - strokeOuterWidth;

        const innerHorizontal = halfWidth - strokeInnerWidth;
        const innerVertical = halfHeight - strokeInnerWidth;

        const outerHorizontal = halfWidth + strokeOuterWidth;
        const outerVertical = halfHeight + strokeOuterWidth;

        const normalizedX = x - this.x;
        const normalizedY = y - this.y;

        const innerEllipse = ((normalizedX * normalizedX) / (innerHorizontal * innerHorizontal))
            + ((normalizedY * normalizedY) / (innerVertical * innerVertical));

        const outerEllipse = ((normalizedX * normalizedX) / (outerHorizontal * outerHorizontal))
            + ((normalizedY * normalizedY) / (outerVertical * outerVertical));

        return innerEllipse > 1 && outerEllipse <= 1;
    }

    /**
     * Returns the framing rectangle of the ellipse as a Rectangle object
     * @param out
     * @returns The framing rectangle
     */
    public getBounds(out?: Rectangle): Rectangle
    {
        out ||= new Rectangle();

        out.x = this.x - this.halfWidth;
        out.y = this.y - this.halfHeight;
        out.width = this.halfWidth * 2;
        out.height = this.halfHeight * 2;

        return out;
    }

    /**
     * Copies another ellipse to this one.
     * @param ellipse - The ellipse to copy from.
     * @returns Returns itself.
     */
    public copyFrom(ellipse: Ellipse): this
    {
        this.x = ellipse.x;
        this.y = ellipse.y;
        this.halfWidth = ellipse.halfWidth;
        this.halfHeight = ellipse.halfHeight;

        return this;
    }

    /**
     * Copies this ellipse to another one.
     * @param ellipse - The ellipse to copy to.
     * @returns Returns given parameter.
     */
    public copyTo(ellipse: Ellipse): Ellipse
    {
        ellipse.copyFrom(this);

        return ellipse;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Ellipse x=${this.x} y=${this.y} halfWidth=${this.halfWidth} halfHeight=${this.halfHeight}]`;
    }
    // #endif
}

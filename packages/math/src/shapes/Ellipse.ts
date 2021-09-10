import { Rectangle } from './Rectangle';
import { SHAPES } from '../const';

/** The Ellipse object is used to help draw graphics and can also be used to specify a hit area for displayObjects. */
export class Ellipse
{
    /** @default 0 */
    public x: number;

    /** @default 0 */
    public y: number;

    /** @default 0 */
    public width: number;

    /** @default 0 */
    public height: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @default PIXI.SHAPES.ELIP
     * @see PIXI.SHAPES
     */
    public readonly type: SHAPES.ELIP;

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
        this.width = halfWidth;
        this.height = halfHeight;

        this.type = SHAPES.ELIP;
    }

    /**
     * Creates a clone of this Ellipse instance
     *
     * @return {PIXI.Ellipse} A copy of the ellipse
     */
    clone(): Ellipse
    {
        return new Ellipse(this.x, this.y, this.width, this.height);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this ellipse
     *
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @return Whether the x/y coords are within this ellipse
     */
    contains(x: number, y: number): boolean
    {
        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }

        // normalize the coords to an ellipse with center 0,0
        let normx = ((x - this.x) / this.width);
        let normy = ((y - this.y) / this.height);

        normx *= normx;
        normy *= normy;

        return (normx + normy <= 1);
    }

    /**
     * Returns the framing rectangle of the ellipse as a Rectangle object
     *
     * @return The framing rectangle
     */
    getBounds(): Rectangle
    {
        return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
    }

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:Ellipse x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`;
    }
    // #endif
}

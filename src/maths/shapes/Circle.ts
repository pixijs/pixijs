import { Rectangle } from './Rectangle';

import type { SHAPE_PRIMITIVE } from '../misc/const';
import type { ShapePrimitive } from './ShapePrimitive';

/**
 * The Circle object is used to help draw graphics and can also be used to specify a hit area for containers.
 * @memberof maths
 */
export class Circle implements ShapePrimitive
{
    /**
     * The X coordinate of the center of this circle
     * @default 0
     */
    public x: number;

    /**
     * The Y coordinate of the center of this circle
     * @default 0
     */
    public y: number;

    /**
     * The radius of the circle
     *  @default 0
     */
    public radius: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @default 'circle'
     */
    public readonly type: SHAPE_PRIMITIVE = 'circle';

    /**
     * @param x - The X coordinate of the center of this circle
     * @param y - The Y coordinate of the center of this circle
     * @param radius - The radius of the circle
     */
    constructor(x = 0, y = 0, radius = 0)
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    /**
     * Creates a clone of this Circle instance
     * @returns A copy of the Circle
     */
    public clone(): Circle
    {
        return new Circle(this.x, this.y, this.radius);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this circle
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @returns Whether the x/y coordinates are within this Circle
     */
    public contains(x: number, y: number): boolean
    {
        if (this.radius <= 0) return false;

        const r2 = this.radius * this.radius;
        let dx = (this.x - x);
        let dy = (this.y - y);

        dx *= dx;
        dy *= dy;

        return (dx + dy <= r2);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this circle including the stroke.
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @param width - The width of the line to check
     * @param alignment - The alignment of the stroke, 0.5 by default
     * @returns Whether the x/y coordinates are within this Circle
     */
    public strokeContains(x: number, y: number, width: number, alignment: number = 0.5): boolean
    {
        if (this.radius === 0) return false;

        const dx = (this.x - x);
        const dy = (this.y - y);
        const radius = this.radius;
        const outerWidth = (1 - alignment) * width;
        const distance = Math.sqrt((dx * dx) + (dy * dy));

        return (distance <= radius + outerWidth && distance > radius - (width - outerWidth));
    }

    /**
     * Returns the framing rectangle of the circle as a Rectangle object
     * @param out
     * @returns The framing rectangle
     */
    public getBounds(out?: Rectangle): Rectangle
    {
        out ||= new Rectangle();

        out.x = this.x - this.radius;
        out.y = this.y - this.radius;
        out.width = this.radius * 2;
        out.height = this.radius * 2;

        return out;
    }

    /**
     * Copies another circle to this one.
     * @param circle - The circle to copy from.
     * @returns Returns itself.
     */
    public copyFrom(circle: Circle): this
    {
        this.x = circle.x;
        this.y = circle.y;
        this.radius = circle.radius;

        return this;
    }

    /**
     * Copies this circle to another one.
     * @param circle - The circle to copy to.
     * @returns Returns given parameter.
     */
    public copyTo(circle: Circle): Circle
    {
        circle.copyFrom(this);

        return circle;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Circle x=${this.x} y=${this.y} radius=${this.radius}]`;
    }
    // #endif
}

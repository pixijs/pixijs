import { type PointData } from '../../../maths/point/PointData';
import { Rectangle } from '../../../maths/shapes/Rectangle';

/**
 * Converts an array of numbers to a Rectangle object.
 * @param data - An array containing the x, y, width, and height of the rectangle.
 * @returns A Rectangle object or undefined if the input is invalid.
 * @internal
 */
export function toRectangle(data: [number, number, number, number] | undefined): Rectangle | undefined
{
    if (!data) return undefined;

    const [x, y, width, height] = data;

    return new Rectangle(x, y, width, height);
}

/**
 * Converts an array of numbers to a PointData object.
 * @param data - An array containing the x and y coordinates of the point.
 * @returns A PointData object or undefined if the input is invalid.
 * @internal
 */
export function toPointData(data: [number, number] | undefined): PointData | undefined
{
    if (!data) return undefined;

    const [x, y] = data;

    return { x, y };
}

import './Point';
import './Rectangle';

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

import { Circle } from '@pixi/math';

describe('Circle', () =>
{
    it('should create a new circle', () =>
    {
        const circ1 = new Circle();

        expect(circ1.x).toEqual(0);
        expect(circ1.y).toEqual(0);
        expect(circ1.radius).toEqual(0);

        const circ2 = new Circle(10, 10, 5);

        expect(circ2.x).toEqual(10);
        expect(circ2.y).toEqual(10);
        expect(circ2.radius).toEqual(5);
    });

    it('should clone a new circle', () =>
    {
        const circ1 = new Circle(10, 10, 5);

        expect(circ1.x).toEqual(10);
        expect(circ1.y).toEqual(10);
        expect(circ1.radius).toEqual(5);

        const circ2 = circ1.clone();

        expect(circ2.x).toEqual(10);
        expect(circ2.y).toEqual(10);
        expect(circ2.radius).toEqual(5);
        expect(circ1).not.toBe(circ2);
    });

    it('should check if point is within circle', () =>
    {
        const circ1 = new Circle(10, 10, 5);

        expect(circ1.contains(10, 10)).toBe(true);
        expect(circ1.contains(10, 15)).toBe(true);
        expect(circ1.contains(15, 10)).toBe(true);
        expect(circ1.contains(5, 10)).toBe(true);
        expect(circ1.contains(15, 10)).toBe(true);

        expect(circ1.contains(6, 7)).toBe(true);
        expect(circ1.contains(7, 6)).toBe(true);
        expect(circ1.contains(7, 7)).toBe(true);
        expect(circ1.contains(13, 14)).toBe(true);
        expect(circ1.contains(14, 13)).toBe(true);

        expect(circ1.contains(14, 14)).toBe(false);
        expect(circ1.contains(10, 16)).toBe(false);
        expect(circ1.contains(11, 15)).toBe(false);
        expect(circ1.contains(0, 0)).toBe(false);

        const circ2 = new Circle(10, 10, 0);

        expect(circ2.contains(10, 10)).toBe(false);
    });

    it('should return framing rectangle', () =>
    {
        const circ1 = new Circle(10, 10, 5);
        const rect1 = circ1.getBounds();

        expect(rect1.left).toEqual(5);
        expect(rect1.top).toEqual(5);
        expect(rect1.right).toEqual(15);
        expect(rect1.bottom).toEqual(15);
    });
});

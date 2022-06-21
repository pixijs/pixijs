import { Ellipse } from '@pixi/math';

describe('Ellipse', () =>
{
    it('should create a new ellipse', () =>
    {
        const ellipse1 = new Ellipse();

        expect(ellipse1.x).toEqual(0);
        expect(ellipse1.y).toEqual(0);
        expect(ellipse1.width).toEqual(0);
        expect(ellipse1.height).toEqual(0);

        const ellipse2 = new Ellipse(10, 10, 5, 5);

        expect(ellipse2.x).toEqual(10);
        expect(ellipse2.y).toEqual(10);
        expect(ellipse2.width).toEqual(5);
        expect(ellipse2.height).toEqual(5);
    });

    it('should clone a new ellipse', () =>
    {
        const ellipse1 = new Ellipse(10, 10, 5, 5);

        expect(ellipse1.x).toEqual(10);
        expect(ellipse1.y).toEqual(10);
        expect(ellipse1.width).toEqual(5);
        expect(ellipse1.height).toEqual(5);

        const ellipse2 = ellipse1.clone();

        expect(ellipse2.x).toEqual(10);
        expect(ellipse2.y).toEqual(10);
        expect(ellipse2.width).toEqual(5);
        expect(ellipse2.height).toEqual(5);
    });

    it('should check if point is within ellipse', () =>
    {
        const ellipse1 = new Ellipse(10, 10, 5, 5);

        expect(ellipse1.contains(10, 10)).toBe(true);
        expect(ellipse1.contains(10, 15)).toBe(true);
        expect(ellipse1.contains(15, 10)).toBe(true);
        expect(ellipse1.contains(5, 10)).toBe(true);
        expect(ellipse1.contains(15, 10)).toBe(true);

        expect(ellipse1.contains(6, 7)).toBe(true);
        expect(ellipse1.contains(7, 6)).toBe(true);
        expect(ellipse1.contains(7, 7)).toBe(true);
        expect(ellipse1.contains(13, 14)).toBe(true);
        expect(ellipse1.contains(14, 13)).toBe(true);

        expect(ellipse1.contains(14, 14)).toBe(false);
        expect(ellipse1.contains(10, 16)).toBe(false);
        expect(ellipse1.contains(11, 15)).toBe(false);
        expect(ellipse1.contains(0, 0)).toBe(false);

        const ellipse2 = new Ellipse(10, 10, 0, 0);

        expect(ellipse2.contains(10, 10)).toBe(false);
    });

    it('should return framing rectangle', () =>
    {
        const ellipse1 = new Ellipse(10, 10, 5, 5);
        const rect1 = ellipse1.getBounds();

        expect(rect1.left).toEqual(5);
        expect(rect1.top).toEqual(5);
        expect(rect1.right).toEqual(10);
        expect(rect1.bottom).toEqual(10);
    });
});

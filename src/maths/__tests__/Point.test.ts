import { Point } from '../point/Point';

describe('Point', () =>
{
    it('should create a new point', () =>
    {
        const pt = new Point();

        expect(pt.x).toEqual(0);
        expect(pt.y).toEqual(0);
    });

    it('should clone a new point', () =>
    {
        const p1 = new Point(10, 20);

        expect(p1.x).toEqual(10);
        expect(p1.y).toEqual(20);

        const p2 = p1.clone();

        expect(p2.x).toEqual(10);
        expect(p2.y).toEqual(20);
        expect(p1).not.toBe(p2);
        expect(p1.equals(p2)).toBe(true);
    });

    it('should copy from one point to another', () =>
    {
        const p1 = new Point(10, 20);
        const p2 = new Point(2, 5);

        p1.copyFrom(p2);

        expect(p1.x).toEqual(2);
        expect(p1.y).toEqual(5);
    });

    it('should set a new value', () =>
    {
        const p1 = new Point(10, 20);

        p1.set();
        expect(p1.x).toEqual(0);
        expect(p1.y).toEqual(0);

        p1.set(1);
        expect(p1.x).toEqual(1);
        expect(p1.y).toEqual(1);

        p1.set(1, 0);
        expect(p1.x).toEqual(1);
        expect(p1.y).toEqual(0);
    });
});

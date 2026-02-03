import { RoundedRectangle } from '../shapes/RoundedRectangle';

describe('RoundedRectangle', () =>
{
    it('should create a new rounded rectangle', () =>
    {
        const rrect = new RoundedRectangle(5, 5, 1, 1);

        expect(rrect.x).toEqual(5);
        expect(rrect.y).toEqual(5);
        expect(rrect.width).toEqual(1);
        expect(rrect.height).toEqual(1);
        expect(rrect.radius).toEqual(20);
    });

    it('should clone a new rounded rectangle', () =>
    {
        const rrect1 = new RoundedRectangle(0, 0, 100, 100, 40);

        expect(rrect1.x).toEqual(0);
        expect(rrect1.y).toEqual(0);
        expect(rrect1.width).toEqual(100);
        expect(rrect1.height).toEqual(100);
        expect(rrect1.radius).toEqual(40);

        const rrect2 = rrect1.clone();

        expect(rrect2.x).toEqual(0);
        expect(rrect2.y).toEqual(0);
        expect(rrect2.width).toEqual(100);
        expect(rrect2.height).toEqual(100);
        expect(rrect2.radius).toEqual(40);
        expect(rrect1).not.toBe(rrect2);
    });

    it('should check if point is within rounded rectangle', () =>
    {
        const rrect1 = new RoundedRectangle(0, 0, 200, 200, 50);

        expect(rrect1.contains(50, 50)).toBe(true);
        expect(rrect1.contains(5, 100)).toBe(true);
        expect(rrect1.contains(100, 5)).toBe(true);
        expect(rrect1.contains(195, 100)).toBe(true);
        expect(rrect1.contains(100, 195)).toBe(true);
        expect(rrect1.contains(20, 20)).toBe(true);
        expect(rrect1.contains(180, 20)).toBe(true);
        expect(rrect1.contains(180, 180)).toBe(true);
        expect(rrect1.contains(20, 180)).toBe(true);
        expect(rrect1.contains(10, 10)).toBe(false);
        expect(rrect1.contains(190, 10)).toBe(false);
        expect(rrect1.contains(190, 190)).toBe(false);
        expect(rrect1.contains(10, 190)).toBe(false);

        const rrect2 = new RoundedRectangle(0, 0, 10, 0, 1);

        expect(rrect2.contains(0, 0)).toBe(false);

        const rrect3 = new RoundedRectangle(0, 0, 0, 10, 1);

        expect(rrect3.contains(0, 0)).toBe(false);

        const rrect4 = new RoundedRectangle(0, 0, 10, 10, 1000);

        expect(rrect4.contains(5, 5)).toBe(true);
    });

    describe('strokeContains', () =>
    {
        const rectangle = new RoundedRectangle(0, 0, 100, 100, 10);

        it('alignment 0', () =>
        {
            expect(rectangle.strokeContains(-9, -9, 20, 0)).toBe(true);
            expect(rectangle.strokeContains(0, 0, 20, 0)).toBe(true);
            expect(rectangle.strokeContains(10, 10, 20, 0)).toBe(false);
            expect(rectangle.strokeContains(12, 12, 20, 0)).toBe(false);
            expect(rectangle.strokeContains(25, 25, 20, 1)).toBe(false);
        });

        it('alignment 0.5', () =>
        {
            expect(rectangle.strokeContains(-9, -9, 20, 0.5)).toBe(false);
            expect(rectangle.strokeContains(0, 0, 20, 0.5)).toBe(true);
            expect(rectangle.strokeContains(10, 10, 20, 0.5)).toBe(true);
            expect(rectangle.strokeContains(12, 12, 20, 0.5)).toBe(false);
            expect(rectangle.strokeContains(25, 25, 20, 1)).toBe(false);
        });

        it('alignment 1', () =>
        {
            expect(rectangle.strokeContains(-9, -9, 20, 1)).toBe(false);
            expect(rectangle.strokeContains(0, 0, 20, 1)).toBe(false);
            expect(rectangle.strokeContains(10, 10, 20, 1)).toBe(true);
            expect(rectangle.strokeContains(12, 12, 20, 1)).toBe(true);
            expect(rectangle.strokeContains(25, 25, 20, 1)).toBe(false);
        });
    });
});

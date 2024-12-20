import { Ellipse } from '../shapes/Ellipse';

describe('Ellipse', () =>
{
    it('should create a new ellipse', () =>
    {
        const ellipse1 = new Ellipse();

        expect(ellipse1.x).toEqual(0);
        expect(ellipse1.y).toEqual(0);
        expect(ellipse1.halfWidth).toEqual(0);
        expect(ellipse1.halfHeight).toEqual(0);

        const ellipse2 = new Ellipse(10, 10, 5, 5);

        expect(ellipse2.x).toEqual(10);
        expect(ellipse2.y).toEqual(10);
        expect(ellipse2.halfWidth).toEqual(5);
        expect(ellipse2.halfHeight).toEqual(5);
    });

    it('should clone a new ellipse', () =>
    {
        const ellipse1 = new Ellipse(10, 10, 5, 5);

        expect(ellipse1.x).toEqual(10);
        expect(ellipse1.y).toEqual(10);
        expect(ellipse1.halfWidth).toEqual(5);
        expect(ellipse1.halfHeight).toEqual(5);

        const ellipse2 = ellipse1.clone();

        expect(ellipse2.x).toEqual(10);
        expect(ellipse2.y).toEqual(10);
        expect(ellipse2.halfWidth).toEqual(5);
        expect(ellipse2.halfHeight).toEqual(5);
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

    describe('strokeContains', () =>
    {
        it('alignment = 0, outside', () =>
        {
            const ellipse = new Ellipse(2, 2, 10, 10); // -8, 12 // for 3 width -8 -7 -6  10 11 12

            expect(ellipse.strokeContains(-11, 0, 3, 0)).toBe(false);
            expect(ellipse.strokeContains(-10, 0, 3, 0)).toBe(true);
            expect(ellipse.strokeContains(-9, 0, 3, 0)).toBe(true);
            expect(ellipse.strokeContains(-8, 0, 3, 0)).toBe(true);
            expect(ellipse.strokeContains(-7, 0, 3, 0)).toBe(false);

            expect(ellipse.strokeContains(11, 0, 3, 0)).toBe(false);
            expect(ellipse.strokeContains(12, 0, 3, 0)).toBe(true);
            expect(ellipse.strokeContains(13, 0, 3, 0)).toBe(true);
            expect(ellipse.strokeContains(14, 0, 3, 0)).toBe(true);
            expect(ellipse.strokeContains(15, 0, 3, 0)).toBe(false);
        });

        it('alignment = 0.5, center', () =>
        {
            const ellipse = new Ellipse(2, 2, 10, 10); // -8, 12 // for 3 width -8 -7 -6  10 11 12

            expect(ellipse.strokeContains(-10, 0, 3, 0.5)).toBe(false);
            expect(ellipse.strokeContains(-9, 0, 3, 0.5)).toBe(true);
            expect(ellipse.strokeContains(-8, 0, 3, 0.5)).toBe(true);
            expect(ellipse.strokeContains(-7, 0, 3, 0.5)).toBe(true);
            expect(ellipse.strokeContains(-6, 0, 3, 0.5)).toBe(false);

            expect(ellipse.strokeContains(10, 0, 3, 0.5)).toBe(false);
            expect(ellipse.strokeContains(11, 0, 3, 0.5)).toBe(true);
            expect(ellipse.strokeContains(12, 0, 3, 0.5)).toBe(true);
            expect(ellipse.strokeContains(13, 0, 3, 0.5)).toBe(true);
            expect(ellipse.strokeContains(14, 0, 3, 0.5)).toBe(false);
        });

        it('alignment = 1, inside', () =>
        {
            const ellipse = new Ellipse(2, 2, 10, 10); // -8, 12 // for 3 width -8 -7 -6  10 11 12

            expect(ellipse.strokeContains(-8, 0, 3, 1)).toBe(false);
            expect(ellipse.strokeContains(-7, 0, 3, 1)).toBe(true);
            expect(ellipse.strokeContains(-6, 0, 3, 1)).toBe(true);
            expect(ellipse.strokeContains(-5, 0, 3, 1)).toBe(true);
            expect(ellipse.strokeContains(-4, 0, 3, 1)).toBe(false);

            expect(ellipse.strokeContains(12, 0, 3, 1)).toBe(false);
            expect(ellipse.strokeContains(11, 0, 3, 1)).toBe(true);
            expect(ellipse.strokeContains(10, 0, 3, 1)).toBe(true);
            expect(ellipse.strokeContains(9, 0, 3, 1)).toBe(true);
            expect(ellipse.strokeContains(8, 0, 3, 1)).toBe(false);
        });
    });

    it('should return framing rectangle', () =>
    {
        const ellipse1 = new Ellipse(10, 10, 5, 5);
        const rect1 = ellipse1.getBounds();

        expect(rect1.left).toEqual(5);
        expect(rect1.top).toEqual(5);
        expect(rect1.right).toEqual(15); // note: this was 10 in the original test
        expect(rect1.bottom).toEqual(15); // note: this was 10 in the original test
    });
});

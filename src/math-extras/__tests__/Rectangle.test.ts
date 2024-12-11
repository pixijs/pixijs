import '../init';
import { Rectangle } from '~/maths';

describe('Rectangle', () =>
{
    describe('containsRect', () =>
    {
        it('should return true if all four corners are inside or on the edge of the rectangle', () =>
        {
            /*
                +-----------------+-----------------+
                |   A             |   B             |
                |    +------+     |                 |
                |    |  C   |     |                 |
                |    |      |     |       🄳         |
                |    |      |     |                 |
                |    +------+     |                 |
                |                 |                 |
                +-----------------+-----------------+
            */
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(100, 0, 100, 100);
            const c = new Rectangle(25, 25, 50, 50);
            const d = new Rectangle(150, 50, 0, 0);

            // a contains c
            expect(a.containsRect(c)).toEqual(true);
            // but c doesn't contain a
            expect(c.containsRect(a)).toEqual(false);

            // b doesn't contain c
            expect(a.containsRect(b)).toEqual(false);

            // B contains D. An empty rectangle **CAN** be contained
            expect(b.containsRect(d)).toEqual(true);

            // Any rectangle with area contains itself
            expect(a.containsRect(a.clone())).toEqual(true);
            expect(b.containsRect(b.clone())).toEqual(true);
            expect(c.containsRect(c.clone())).toEqual(true);

            // An empty rectangle can't contain anything, thus it can't contain itself
            expect(d.containsRect(d.clone())).toEqual(false);
        });
    });

    describe('equals', () =>
    {
        it('should return true x, y, width and height match', () =>
        {
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(0, 0, 100, 100);
            const c = new Rectangle(50, 50, 100, 100);

            // a is equal to b
            expect(a.equals(b)).toEqual(true);
            // thus b is equal to a
            expect(b.equals(a)).toEqual(true);

            // c is not equal to a
            expect(a.equals(c)).toEqual(false);

            // any point is equal to themselves
            expect(a.equals(a.clone())).toEqual(true);
            expect(b.equals(b.clone())).toEqual(true);
            expect(c.equals(c.clone())).toEqual(true);
        });
    });
    describe('intersection', () =>
    {
        it('should return a rectangle with the intersection if the area is > 0, otherwise an empty rectangle',
            () =>
            {
                /*
                +--------+
                |   A    |
                |   +---+---+
                |   | 🄴 | B |
                +---|---+---|-----+
                    |   |   |     |
                    +---+---+ C   |
                        |         |
                        +---------+
                */
                const a = new Rectangle(0, 0, 100, 100);
                const b = new Rectangle(50, 50, 100, 100);
                const c = new Rectangle(100, 100, 100, 100);
                const empty = new Rectangle(75, 75, 0, 0);
                const d = a.intersection(b);
                const e = a.intersection(c);
                const emptyIntersects = empty.intersection(b);
                const intersectingEmpty = b.intersection(empty);
                const emptyIntersectsItself = empty.intersection(empty);

                expect(d.x).toEqual(50);
                expect(d.y).toEqual(50);
                expect(d.width).toEqual(50);
                expect(d.height).toEqual(50);

                expect(e.x).toEqual(0);
                expect(e.y).toEqual(0);
                expect(e.width).toEqual(0);
                expect(e.height).toEqual(0);

                // empty rectangles can't intersect or be intersected
                expect(emptyIntersects.x).toEqual(0);
                expect(emptyIntersects.y).toEqual(0);
                expect(emptyIntersects.width).toEqual(0);
                expect(emptyIntersects.height).toEqual(0);

                expect(intersectingEmpty.x).toEqual(0);
                expect(intersectingEmpty.y).toEqual(0);
                expect(intersectingEmpty.width).toEqual(0);
                expect(intersectingEmpty.height).toEqual(0);

                expect(emptyIntersectsItself.x).toEqual(0);
                expect(emptyIntersectsItself.y).toEqual(0);
                expect(emptyIntersectsItself.width).toEqual(0);
                expect(emptyIntersectsItself.height).toEqual(0);
            });

        it('should return the same reference given', () =>
        {
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(50, 50, 100, 100);
            const c = a.intersection(b, a);

            expect(c).toEqual(a);
        });
    });

    describe('union', () =>
    {
        it('should return a rectangle that includes both rectangles (similar to enlarge)',
            () =>
            {
                const a = new Rectangle(0, 0, 100, 100);
                const b = new Rectangle(50, 50, 100, 100);
                const c = a.union(b);

                expect(c.x).toEqual(0);
                expect(c.y).toEqual(0);
                expect(c.width).toEqual(150);
                expect(c.height).toEqual(150);
            });

        it('should return the same reference given', () =>
        {
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(50, 50, 100, 100);
            const c = a.union(b, a);

            expect(c).toEqual(a);
        });

        it('should return the same values as enalrge()',
            () =>
            {
                const enlarged = new Rectangle(0, 0, 100, 100);
                const a = new Rectangle(0, 0, 100, 100);
                const b = new Rectangle(50, 50, 100, 100);
                const c = a.union(b);

                enlarged.enlarge(b);

                expect(c.x).toEqual(enlarged.x);
                expect(c.y).toEqual(enlarged.y);
                expect(c.width).toEqual(enlarged.width);
                expect(c.height).toEqual(enlarged.height);
            });
    });
});

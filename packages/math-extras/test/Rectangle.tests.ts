import { Rectangle } from '@pixi/math';
import { expect } from 'chai';
import '@pixi/math-extras';

describe('Rectangle', function ()
{
    describe('intersects', function ()
    {
        it('should return true if the area of the intersection > 0', function ()
        {
            /*
            ! SHARING A SIDE IS NOT INTERSECTING !
                +--------+--------+
                |   A    |    B   |
                |    +---+--+     |
                |    |  E|  |     |
                +----|---+--|-----+
                |    |   |  |     |
                |  C +---+--+ D   |
                |        | 🄵      |
                +--------+--------+
            */
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(100, 0, 100, 100);
            const c = new Rectangle(0, 100, 100, 100);
            const d = new Rectangle(100, 100, 100, 100);
            const e = new Rectangle(50, 50, 100, 100);
            const f = new Rectangle(150, 175, 0, 0);

            // e intersects a,b,c,d
            expect(e.intersects(a)).to.equal(true);
            expect(e.intersects(b)).to.equal(true);
            expect(e.intersects(c)).to.equal(true);
            expect(e.intersects(d)).to.equal(true);

            // works the other way arround
            expect(a.intersects(e)).to.equal(true);
            expect(b.intersects(e)).to.equal(true);
            expect(c.intersects(e)).to.equal(true);
            expect(d.intersects(e)).to.equal(true);

            // none of the other intersect (sharing a side it is NOT intersecting!)
            expect(a.intersects(b)).to.equal(false); // share Y side
            expect(b.intersects(d)).to.equal(false); // share X side
            expect(c.intersects(b)).to.equal(false); // share single point

            // Since F has no area, the intersection with D it's 0 so it's false.
            expect(f.intersects(d)).to.equal(false);

            // Any rectangle with area intersects itself
            expect(a.intersects(a.clone())).to.equal(true);
            expect(b.intersects(b.clone())).to.equal(true);
            expect(c.intersects(c.clone())).to.equal(true);
            expect(d.intersects(d.clone())).to.equal(true);
            expect(e.intersects(e.clone())).to.equal(true);

            // A point without area can't have an intersection, thus it can't even intersect itself
            expect(f.intersects(f.clone())).to.equal(false);
        });
    });

    describe('containsRect', function ()
    {
        it('should return true if all four corners are inside or on the edge of the rectangle', function ()
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
            expect(a.containsRect(c)).to.equal(true);
            // but c doesn't contain a
            expect(c.containsRect(a)).to.equal(false);

            // b doesn't contain c
            expect(a.containsRect(b)).to.equal(false);

            // B contains D. An empty rectangle **CAN** be contained
            expect(b.containsRect(d)).to.equal(true);

            // Any rectangle with area contains itself
            expect(a.containsRect(a.clone())).to.equal(true);
            expect(b.containsRect(b.clone())).to.equal(true);
            expect(c.containsRect(c.clone())).to.equal(true);

            // An empty rectangle can't contain anything, thus it can't contain itself
            expect(d.containsRect(d.clone())).to.equal(false);
        });
    });

    describe('equals', function ()
    {
        it('should return true x, y, width and height match', function ()
        {
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(0, 0, 100, 100);
            const c = new Rectangle(50, 50, 100, 100);

            // a is equal to b
            expect(a.equals(b)).to.equal(true);
            // thus b is equal to a
            expect(b.equals(a)).to.equal(true);

            // c is not equal to a
            expect(a.equals(c)).to.equal(false);

            // any point is equal to themselves
            expect(a.equals(a.clone())).to.equal(true);
            expect(b.equals(b.clone())).to.equal(true);
            expect(c.equals(c.clone())).to.equal(true);
        });
    });
    describe('intersection', function ()
    {
        it('should return a rectangle with the intersection if the area is > 0, otherwise an empty rectangle',
            function ()
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

                expect(d.x).to.equal(50);
                expect(d.y).to.equal(50);
                expect(d.width).to.equal(50);
                expect(d.height).to.equal(50);

                expect(e.x).to.equal(0);
                expect(e.y).to.equal(0);
                expect(e.width).to.equal(0);
                expect(e.height).to.equal(0);

                // empty rectangles can't intersect or be intersected
                expect(emptyIntersects.x).to.equal(0);
                expect(emptyIntersects.y).to.equal(0);
                expect(emptyIntersects.width).to.equal(0);
                expect(emptyIntersects.height).to.equal(0);

                expect(intersectingEmpty.x).to.equal(0);
                expect(intersectingEmpty.y).to.equal(0);
                expect(intersectingEmpty.width).to.equal(0);
                expect(intersectingEmpty.height).to.equal(0);

                expect(emptyIntersectsItself.x).to.equal(0);
                expect(emptyIntersectsItself.y).to.equal(0);
                expect(emptyIntersectsItself.width).to.equal(0);
                expect(emptyIntersectsItself.height).to.equal(0);
            });

        it('should return the same reference given', function ()
        {
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(50, 50, 100, 100);
            const c = a.intersection(b, a);

            expect(c).to.equal(a);
        });
    });

    describe('union', function ()
    {
        it('should return a rectangle that includes both rectangles (similar to enlarge)',
            function ()
            {
                const a = new Rectangle(0, 0, 100, 100);
                const b = new Rectangle(50, 50, 100, 100);
                const c = a.union(b);

                expect(c.x).to.equal(0);
                expect(c.y).to.equal(0);
                expect(c.width).to.equal(150);
                expect(c.height).to.equal(150);
            });

        it('should return the same reference given', function ()
        {
            const a = new Rectangle(0, 0, 100, 100);
            const b = new Rectangle(50, 50, 100, 100);
            const c = a.union(b, a);

            expect(c).to.equal(a);
        });

        it('should return the same values as enalrge()',
            function ()
            {
                const enlarged = new Rectangle(0, 0, 100, 100);
                const a = new Rectangle(0, 0, 100, 100);
                const b = new Rectangle(50, 50, 100, 100);
                const c = a.union(b);

                enlarged.enlarge(b);

                expect(c.x).to.equal(enlarged.x);
                expect(c.y).to.equal(enlarged.y);
                expect(c.width).to.equal(enlarged.width);
                expect(c.height).to.equal(enlarged.height);
            });
    });
});

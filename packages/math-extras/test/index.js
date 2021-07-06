const { ObservablePoint, Point, Rectangle } = require('@pixi/math');
const { floatEqual, lineIntersection, segmentIntersection } = require('@pixi/math-extras');
const { expect } = require('chai');

require('../');

describe('@pixi/math-extras#Point.add', function ()
{
    it('add() should add component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.add(b);

        expect(c.x).to.equal(4);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.add(ob);

        expect(oc.x).to.equal(4);
        expect(oc.y).to.equal(6);
    });

    it('add() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.add(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.add(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('add() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.add(b, { x: 0, y: 0 });

        expect(c.x).to.equal(4);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.add(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(4);
        expect(oc.y).to.equal(6);
    });

    it('add() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.add({ x: 3, y: 4 });

        expect(c.x).to.equal(4);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.add({ x: 3, y: 4 });

        expect(oc.x).to.equal(4);
        expect(oc.y).to.equal(6);
    });
});

describe('@pixi/math-extras#Point.subtract', function ()
{
    it('subtract() should subtract component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.subtract(b);

        expect(c.x).to.equal(-2);
        expect(c.y).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.subtract(ob);

        expect(oc.x).to.equal(-2);
        expect(oc.y).to.equal(-2);
    });

    it('subtract() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.subtract(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.subtract(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('subtract() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.subtract(b, { x: 0, y: 0 });

        expect(c.x).to.equal(-2);
        expect(c.y).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.subtract(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(-2);
        expect(oc.y).to.equal(-2);
    });

    it('subtract() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.subtract({ x: 3, y: 4 });

        expect(c.x).to.equal(-2);
        expect(c.y).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.subtract({ x: 3, y: 4 });

        expect(oc.x).to.equal(-2);
        expect(oc.y).to.equal(-2);
    });
});

describe('@pixi/math-extras#Point.multiply', function ()
{
    it('multiply() should multiply component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.multiply(b);

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(8);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.multiply(ob);

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(8);
    });

    it('multiply() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.multiply(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.multiply(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('multiply() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.multiply(b, { x: 0, y: 0 });

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(8);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.multiply(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(8);
    });

    it('multiply() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.multiply({ x: 3, y: 4 });

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(8);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.multiply({ x: 3, y: 4 });

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(8);
    });
});

describe('@pixi/math-extras#Point.multiplyScalar', function ()
{
    it('multiplyScalar() should multiply both components by a scalar', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.multiplyScalar(3);

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.multiplyScalar(3);

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(6);
    });

    it('multiplyScalar() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.multiplyScalar(3, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.multiplyScalar(3, oa);

        expect(oc).to.equal(oa);
    });

    it('multiplyScalar() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.multiplyScalar(3, { x: 0, y: 0 });

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.multiplyScalar(3, { x: 0, y: 0 });

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(6);
    });
});

describe('@pixi/math-extras#Point.dot', function ()
{
    it('dot() should multiply component-wise and then add both components', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.dot(b);

        expect(c).to.equal(11);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.dot(ob);

        expect(oc).to.equal(11);
    });
});

describe('@pixi/math-extras#Point.cross', function ()
{
    it('cross() should return the magnitude of the result of a cross product', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.cross(b);

        expect(c).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.cross(ob);

        expect(oc).to.equal(-2);
    });
});

describe('@pixi/math-extras#Point.normalize', function ()
{
    it('normalize() magnitude should be 1', function ()
    {
        // Point
        const a = new Point(3, 4);
        const c = a.normalize();

        const magnitude = Math.sqrt((c.x * c.x) + (c.y * c.y));

        expect(magnitude).to.be.closeTo(1, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.normalize();

        const omagnitude = Math.sqrt((oc.x * oc.x) + (oc.y * oc.y));

        expect(omagnitude).to.be.closeTo(1, 0.001);
    });

    it('normalize() should return the same reference given', function ()
    {
        // Point
        const a = new Point(3, 4);
        const c = a.normalize(a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.normalize(oa);

        expect(oc).to.equal(oa);
    });

    it('normalize() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.normalize({ x: 0, y: 0 });

        const magnitude = Math.sqrt((c.x * c.x) + (c.y * c.y));

        expect(magnitude).to.be.closeTo(1, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.normalize({ x: 0, y: 0 });

        const omagnitude = Math.sqrt((oc.x * oc.x) + (oc.y * oc.y));

        expect(omagnitude).to.be.closeTo(1, 0.001);
    });
});

describe('@pixi/math-extras#Point.magnitude', function ()
{
    it('magnitude() should return the square root of the sum of the squares of each component', function ()
    {
        const expectedMagnitude = Math.sqrt((3 * 3) + (4 * 4));
        // Point
        const a = new Point(3, 4);
        const c = a.magnitude();

        expect(c).to.be.closeTo(expectedMagnitude, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.magnitude();

        expect(oc).to.be.closeTo(expectedMagnitude, 0.001);
    });

    it('magnitudeSquared() should return the sum of the squares of each component', function ()
    {
        const expectedMagnitudeSquared = (3 * 3) + (4 * 4);
        // Point
        const a = new Point(3, 4);
        const c = a.magnitudeSquared();

        expect(c).to.be.closeTo(expectedMagnitudeSquared, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.magnitudeSquared();

        expect(oc).to.equal(expectedMagnitudeSquared);
    });
});

describe('@pixi/math-extras#Point.project', function ()
{
    it('project() should return the vector projection of a vector onto another nonzero vector', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.project(b);

        expect(c.x).to.be.closeTo(33 / 25, 0.001);
        expect(c.y).to.be.closeTo(44 / 25, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.project(ob);

        expect(oc.x).to.be.closeTo(33 / 25, 0.001);
        expect(oc.y).to.be.closeTo(44 / 25, 0.001);
    });

    it('project() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.project(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.project(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('project() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.project(b, { x: 0, y: 0 });

        expect(c.x).to.be.closeTo(33 / 25, 0.001);
        expect(c.y).to.be.closeTo(44 / 25, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.project(ob, { x: 0, y: 0 });

        expect(oc.x).to.be.closeTo(33 / 25, 0.001);
        expect(oc.y).to.be.closeTo(44 / 25, 0.001);
    });

    it('project() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.project({ x: 3, y: 4 });

        expect(c.x).to.be.closeTo(33 / 25, 0.001);
        expect(c.y).to.be.closeTo(44 / 25, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.project({ x: 3, y: 4 });

        expect(oc.x).to.be.closeTo(33 / 25, 0.001);
        expect(oc.y).to.be.closeTo(44 / 25, 0.001);
    });
});

describe('@pixi/math-extras#Point.reflect', function ()
{
    it('reflect() should return the specular reflect vector', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.reflect(b);

        expect(c.x).to.equal(-65);
        expect(c.y).to.equal(-86);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.reflect(ob);

        expect(oc.x).to.equal(-65);
        expect(oc.y).to.equal(-86);
    });

    it('reflect() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.reflect(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.reflect(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('reflect() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.reflect(b, { x: 0, y: 0 });

        expect(c.x).to.equal(-65);
        expect(c.y).to.equal(-86);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.reflect(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(-65);
        expect(oc.y).to.equal(-86);
    });

    it('reflect() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.reflect({ x: 3, y: 4 });

        expect(c.x).to.equal(-65);
        expect(c.y).to.equal(-86);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.reflect({ x: 3, y: 4 });

        expect(oc.x).to.equal(-65);
        expect(oc.y).to.equal(-86);
    });
});

describe('@pixi/math-extras#Rectangle.intersects', function ()
{
    it('intersects() should return true if the area of the intersection > 0', function ()
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

describe('@pixi/math-extras#Rectangle.containsRect', function ()
{
    it('containsRect() should return true if all four corners are inside or on the edge of the rectangle', function ()
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

describe('@pixi/math-extras#Rectangle.equals', function ()
{
    it('equals() should return true x, y, width and height match', function ()
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
describe('@pixi/math-extras#Rectangle.intersection', function ()
{
    it('intersection() should return a rectangle with the intersection if the area is > 0, otherwise an empty rectangle',
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

    it('intersection() should return the same reference given', function ()
    {
        const a = new Rectangle(0, 0, 100, 100);
        const b = new Rectangle(50, 50, 100, 100);
        const c = a.intersection(b, a);

        expect(c).to.equal(a);
    });
});

describe('@pixi/math-extras#Rectangle.union', function ()
{
    it('union() should return a rectangle that includes both rectangles (similar to enlarge)',
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

    it('union() should return the same reference given', function ()
    {
        const a = new Rectangle(0, 0, 100, 100);
        const b = new Rectangle(50, 50, 100, 100);
        const c = a.union(b, a);

        expect(c).to.equal(a);
    });

    it('union() should return the same values as enalrge()',
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

describe('@pixi/math-extras#floatEqual', function ()
{
    it('floatEqual() should return true if the difference between values is less than epsilon',
        function ()
        {
            // 0.1 + 0.2 = 0.3 is the common floating point pitfall.
            expect(floatEqual(0.1 + 0.2, 0.3)).to.equal(true);

            // now let's make it false
            expect(floatEqual(0.1 + 0.2 + 0.00001, 0.3)).to.equal(false);
        });
});

describe('@pixi/math-extras#lineIntersection', function ()
{
    it('lineIntersection() should return the point where the lines intersect',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(3, 4);
            const bStart = new Point(5, 8);
            const bEnd = new Point(10, 5);

            const intersect = lineIntersection(aStart, aEnd, bStart, bEnd);

            expect(intersect.x).to.equal(6.25);
            expect(intersect.y).to.equal(7.25);
        });

    it('lineIntersection() should return NaN if the lines are parallel',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(3, 4);
            const parallelStart = new Point(5, 6);
            const parallelEnd = new Point(7, 8);

            const parallel = lineIntersection(aStart, aEnd, parallelStart, parallelEnd);

            expect(parallel.x).to.be.NaN;
            expect(parallel.y).to.be.NaN;
        });
    it('lineIntersection() should return the same reference given', function ()
    {
        // Point
        const aStart = new Point(1, 2);
        const aEnd = new Point(3, 4);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();
        const intersect = lineIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(intersect).to.equal(outValue);
    });

    it('lineIntersection() can output into any IPointData given', function ()
    {
        const aStart = new Point(1, 2);
        const aEnd = new Point(3, 4);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();

        lineIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(outValue.x).to.equal(6.25);
        expect(outValue.y).to.equal(7.25);
    });

    it('lineIntersection() can take any IPointData as input', function ()
    {
        const aStart = { x: 1, y: 2 };
        const aEnd = { x: 3, y: 4 };
        const bStart = { x: 5, y: 8 };
        const bEnd = { x: 10, y: 5 };

        const intersect = lineIntersection(aStart, aEnd, bStart, bEnd);

        expect(intersect.x).to.equal(6.25);
        expect(intersect.y).to.equal(7.25);
    });
});

describe('@pixi/math-extras#segmentIntersection', function ()
{
    it('segmentIntersection() should return the point where the segments intersect',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(11, 12);
            const bStart = new Point(5, 8);
            const bEnd = new Point(10, 5);

            const intersect = segmentIntersection(aStart, aEnd, bStart, bEnd);

            expect(intersect.x).to.equal(6.25);
            expect(intersect.y).to.equal(7.25);
        });

    it('segmentIntersection() should return NaN if the segments are parallel',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(11, 12);
            const parallelStart = new Point(5, 6);
            const parallelEnd = new Point(7, 8);

            const parallel = segmentIntersection(aStart, aEnd, parallelStart, parallelEnd);

            expect(parallel.x).to.be.NaN;
            expect(parallel.y).to.be.NaN;
        });
    it('segmentIntersection() should return NaN if the segments dont intersect',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(3, 4);
            const bStart = new Point(5, 8);
            const bEnd = new Point(10, 5);

            const parallel = segmentIntersection(aStart, aEnd, bStart, bEnd);

            expect(parallel.x).to.be.NaN;
            expect(parallel.y).to.be.NaN;
        });
    it('segmentIntersection() should return the same reference given', function ()
    {
        // Point
        const aStart = new Point(1, 2);
        const aEnd = new Point(11, 12);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();
        const intersect = segmentIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(intersect).to.equal(outValue);
    });

    it('segmentIntersection() can output into any IPointData given', function ()
    {
        const aStart = new Point(1, 2);
        const aEnd = new Point(11, 12);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();

        segmentIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(outValue.x).to.equal(6.25);
        expect(outValue.y).to.equal(7.25);
    });

    it('segmentIntersection() can take any IPointData as input', function ()
    {
        const aStart = { x: 1, y: 2 };
        const aEnd = { x: 11, y: 12 };
        const bStart = { x: 5, y: 8 };
        const bEnd = { x: 10, y: 5 };

        const intersect = segmentIntersection(aStart, aEnd, bStart, bEnd);

        expect(intersect.x).to.equal(6.25);
        expect(intersect.y).to.equal(7.25);
    });
});

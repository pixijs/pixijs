const { ObservablePoint } = require('@pixi/math');
const { Point } = require('@pixi/math');
const { expect } = require('chai');

require('../');

describe('@pixi/math-extras#Point.addition', function ()
{
    it('addition() should add component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.addition(b);

        expect(c.x).to.equal(4);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.addition(ob);

        expect(oc.x).to.equal(4);
        expect(oc.y).to.equal(6);
    });

    it('addition() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.addition(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.addition(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('addition() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.addition(b, { x: 0, y: 0 });

        expect(c.x).to.equal(4);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.addition(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(4);
        expect(oc.y).to.equal(6);
    });

    it('addition() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.addition({ x: 3, y: 4 });

        expect(c.x).to.equal(4);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.addition({ x: 3, y: 4 });

        expect(oc.x).to.equal(4);
        expect(oc.y).to.equal(6);
    });
});

describe('@pixi/math-extras#Point.subtraction', function ()
{
    it('subtraction() should subtract component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.subtraction(b);

        expect(c.x).to.equal(-2);
        expect(c.y).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.subtraction(ob);

        expect(oc.x).to.equal(-2);
        expect(oc.y).to.equal(-2);
    });

    it('subtraction() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.subtraction(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.subtraction(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('subtraction() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.subtraction(b, { x: 0, y: 0 });

        expect(c.x).to.equal(-2);
        expect(c.y).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.subtraction(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(-2);
        expect(oc.y).to.equal(-2);
    });

    it('subtraction() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.subtraction({ x: 3, y: 4 });

        expect(c.x).to.equal(-2);
        expect(c.y).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.subtraction({ x: 3, y: 4 });

        expect(oc.x).to.equal(-2);
        expect(oc.y).to.equal(-2);
    });
});

describe('@pixi/math-extras#Point.multiplication', function ()
{
    it('multiplication() should multiply component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.multiplication(b);

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(8);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.multiplication(ob);

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(8);
    });

    it('multiplication() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.multiplication(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.multiplication(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('multiplication() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.multiplication(b, { x: 0, y: 0 });

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(8);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.multiplication(ob, { x: 0, y: 0 });

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(8);
    });

    it('multiplication() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.multiplication({ x: 3, y: 4 });

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(8);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.multiplication({ x: 3, y: 4 });

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(8);
    });
});

describe('@pixi/math-extras#Point.scalarMultiplication', function ()
{
    it('scalarMultiplication() should multiply both components by a scalar', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.scalarMultiplication(3);

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.scalarMultiplication(3);

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(6);
    });

    it('scalarMultiplication() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.scalarMultiplication(3, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.scalarMultiplication(3, oa);

        expect(oc).to.equal(oa);
    });

    it('scalarMultiplication() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.scalarMultiplication(3, { x: 0, y: 0 });

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(6);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.scalarMultiplication(3, { x: 0, y: 0 });

        expect(oc.x).to.equal(3);
        expect(oc.y).to.equal(6);
    });
});

describe('@pixi/math-extras#Point.dotProduct', function ()
{
    it('dotProduct() should multiply component-wise and then add both components', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.dotProduct(b);

        expect(c).to.equal(11);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.dotProduct(ob);

        expect(oc).to.equal(11);
    });
});

describe('@pixi/math-extras#Point.crossProduct', function ()
{
    it('crossProduct() should return the magnitude of the result of a cross product', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.crossProduct(b);

        expect(c).to.equal(-2);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.crossProduct(ob);

        expect(oc).to.equal(-2);
    });
});

describe('@pixi/math-extras#Point.normalized', function ()
{
    it('normalized() magnitude should be 1', function ()
    {
        // Point
        const a = new Point(3, 4);
        const c = a.normalized();

        const magnitude = Math.sqrt((c.x * c.x) + (c.y * c.y));

        expect(magnitude).to.be.closeTo(1, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.normalized();

        const omagnitude = Math.sqrt((oc.x * oc.x) + (oc.y * oc.y));

        expect(omagnitude).to.be.closeTo(1, 0.001);
    });

    it('normalized() should return the same reference given', function ()
    {
        // Point
        const a = new Point(3, 4);
        const c = a.normalized(a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.normalized(oa);

        expect(oc).to.equal(oa);
    });

    it('normalized() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.normalized({ x: 0, y: 0 });

        const magnitude = Math.sqrt((c.x * c.x) + (c.y * c.y));

        expect(magnitude).to.be.closeTo(1, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.normalized({ x: 0, y: 0 });

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

describe('@pixi/math-extras#Point.projection', function ()
{
    it('projection() should add component-wise', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.projection(b);

        expect(c.x).to.be.closeTo(33 / 25, 0.001);
        expect(c.y).to.be.closeTo(44 / 25, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.projection(ob);

        expect(oc.x).to.be.closeTo(33 / 25, 0.001);
        expect(oc.y).to.be.closeTo(44 / 25, 0.001);
    });

    it('projection() should return the same reference given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.projection(b, a);

        expect(c).to.equal(a);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.projection(ob, oa);

        expect(oc).to.equal(oa);
    });

    it('projection() can output into any IPointData given', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = a.projection(b, { x: 0, y: 0 });

        expect(c.x).to.be.closeTo(33 / 25, 0.001);
        expect(c.y).to.be.closeTo(44 / 25, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = oa.projection(ob, { x: 0, y: 0 });

        expect(oc.x).to.be.closeTo(33 / 25, 0.001);
        expect(oc.y).to.be.closeTo(44 / 25, 0.001);
    });

    it('projection() can take any IPointData as other input', function ()
    {
        // Point
        const a = new Point(1, 2);
        const c = a.projection({ x: 3, y: 4 });

        expect(c.x).to.be.closeTo(33 / 25, 0.001);
        expect(c.y).to.be.closeTo(44 / 25, 0.001);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const oc = oa.projection({ x: 3, y: 4 });

        expect(oc.x).to.be.closeTo(33 / 25, 0.001);
        expect(oc.y).to.be.closeTo(44 / 25, 0.001);
    });
});

describe('@pixi/math-extras#Point.equals', function ()
{
    it('equals() should return true only if both components are equal', function ()
    {
        // Point
        const a = new Point(1, 2);
        const b = new Point(3, 4);
        const c = new Point(1, 2);

        expect(a.equals(b)).to.equal(false);
        expect(a.equals(c)).to.equal(true);

        // ObservablePoint
        const oa = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);
        const ob = new ObservablePoint(() => { /* empty */ }, {}, 3, 4);
        const oc = new ObservablePoint(() => { /* empty */ }, {}, 1, 2);

        expect(oa.equals(ob)).to.equal(false);
        expect(oa.equals(oc)).to.equal(true);
    });
});
import { ObservablePoint, Point } from '@pixi/math';
import { expect } from 'chai';
import '@pixi/math-extras';

describe('Point', function ()
{
    describe('add', function ()
    {
        it('should add component-wise', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

        it('can take any IPointData as other input', function ()
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

    describe('subtract', function ()
    {
        it('should subtract component-wise', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

        it('can take any IPointData as other input', function ()
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

    describe('multiply', function ()
    {
        it('should multiply component-wise', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

        it('can take any IPointData as other input', function ()
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

    describe('multiplyScalar', function ()
    {
        it('should multiply both components by a scalar', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

    describe('dot', function ()
    {
        it('should multiply component-wise and then add both components', function ()
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

    describe('cross', function ()
    {
        it('should return the magnitude of the result of a cross product', function ()
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

    describe('normalize', function ()
    {
        it('magnitude should be 1', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

    describe('magnitude', function ()
    {
        it('should return the square root of the sum of the squares of each component', function ()
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

        it('should return the sum of the squares of each component', function ()
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

    describe('project', function ()
    {
        it('should return the vector projection of a vector onto another nonzero vector', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

        it('can take any IPointData as other input', function ()
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

    describe('reflect', function ()
    {
        it('should return the specular reflect vector', function ()
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

        it('should return the same reference given', function ()
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

        it('can output into any IPointData given', function ()
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

        it('can take any IPointData as other input', function ()
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
});


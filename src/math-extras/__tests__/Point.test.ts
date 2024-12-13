import '../init';
import { ObservablePoint, Point } from '~/maths';

describe('Point', () =>
{
    const observer = { _onUpdate: () => { /* empty */ } };

    describe('add', () =>
    {
        it('should add component-wise', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.add(b);

            expect(c.x).toEqual(4);
            expect(c.y).toEqual(6);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.add(ob);

            expect(oc.x).toEqual(4);
            expect(oc.y).toEqual(6);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.add(b, a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.add(ob, oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.add(b, { x: 0, y: 0 });

            expect(c.x).toEqual(4);
            expect(c.y).toEqual(6);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.add(ob, { x: 0, y: 0 });

            expect(oc.x).toEqual(4);
            expect(oc.y).toEqual(6);
        });

        it('can take any IPointData as other input', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.add({ x: 3, y: 4 });

            expect(c.x).toEqual(4);
            expect(c.y).toEqual(6);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.add({ x: 3, y: 4 });

            expect(oc.x).toEqual(4);
            expect(oc.y).toEqual(6);
        });
    });

    describe('subtract', () =>
    {
        it('should subtract component-wise', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.subtract(b);

            expect(c.x).toEqual(-2);
            expect(c.y).toEqual(-2);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.subtract(ob);

            expect(oc.x).toEqual(-2);
            expect(oc.y).toEqual(-2);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.subtract(b, a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.subtract(ob, oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.subtract(b, { x: 0, y: 0 });

            expect(c.x).toEqual(-2);
            expect(c.y).toEqual(-2);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.subtract(ob, { x: 0, y: 0 });

            expect(oc.x).toEqual(-2);
            expect(oc.y).toEqual(-2);
        });

        it('can take any IPointData as other input', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.subtract({ x: 3, y: 4 });

            expect(c.x).toEqual(-2);
            expect(c.y).toEqual(-2);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.subtract({ x: 3, y: 4 });

            expect(oc.x).toEqual(-2);
            expect(oc.y).toEqual(-2);
        });
    });

    describe('multiply', () =>
    {
        it('should multiply component-wise', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.multiply(b);

            expect(c.x).toEqual(3);
            expect(c.y).toEqual(8);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.multiply(ob);

            expect(oc.x).toEqual(3);
            expect(oc.y).toEqual(8);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.multiply(b, a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.multiply(ob, oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.multiply(b, { x: 0, y: 0 });

            expect(c.x).toEqual(3);
            expect(c.y).toEqual(8);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.multiply(ob, { x: 0, y: 0 });

            expect(oc.x).toEqual(3);
            expect(oc.y).toEqual(8);
        });

        it('can take any IPointData as other input', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.multiply({ x: 3, y: 4 });

            expect(c.x).toEqual(3);
            expect(c.y).toEqual(8);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.multiply({ x: 3, y: 4 });

            expect(oc.x).toEqual(3);
            expect(oc.y).toEqual(8);
        });
    });

    describe('multiplyScalar', () =>
    {
        it('should multiply both components by a scalar', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.multiplyScalar(3);

            expect(c.x).toEqual(3);
            expect(c.y).toEqual(6);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.multiplyScalar(3);

            expect(oc.x).toEqual(3);
            expect(oc.y).toEqual(6);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.multiplyScalar(3, a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.multiplyScalar(3, oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.multiplyScalar(3, { x: 0, y: 0 });

            expect(c.x).toEqual(3);
            expect(c.y).toEqual(6);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.multiplyScalar(3, { x: 0, y: 0 });

            expect(oc.x).toEqual(3);
            expect(oc.y).toEqual(6);
        });
    });

    describe('dot', () =>
    {
        it('should multiply component-wise and then add both components', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.dot(b);

            expect(c).toEqual(11);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.dot(ob);

            expect(oc).toEqual(11);
        });
    });

    describe('cross', () =>
    {
        it('should return the magnitude of the result of a cross product', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.cross(b);

            expect(c).toEqual(-2);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.cross(ob);

            expect(oc).toEqual(-2);
        });
    });

    describe('normalize', () =>
    {
        it('magnitude should be 1', () =>
        {
            // Point
            const a = new Point(3, 4);
            const c = a.normalize();

            const magnitude = Math.sqrt((c.x * c.x) + (c.y * c.y));

            expect(magnitude).toBeCloseTo(1, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 3, 4);
            const oc = oa.normalize();

            const omagnitude = Math.sqrt((oc.x * oc.x) + (oc.y * oc.y));

            expect(omagnitude).toBeCloseTo(1, 0.001);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(3, 4);
            const c = a.normalize(a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 3, 4);
            const oc = oa.normalize(oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.normalize({ x: 0, y: 0 });

            const magnitude = Math.sqrt((c.x * c.x) + (c.y * c.y));

            expect(magnitude).toBeCloseTo(1, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.normalize({ x: 0, y: 0 });

            const omagnitude = Math.sqrt((oc.x * oc.x) + (oc.y * oc.y));

            expect(omagnitude).toBeCloseTo(1, 0.001);
        });
    });

    describe('magnitude', () =>
    {
        it('should return the square root of the sum of the squares of each component', () =>
        {
            const expectedMagnitude = Math.sqrt((3 * 3) + (4 * 4));
            // Point
            const a = new Point(3, 4);
            const c = a.magnitude();

            expect(c).toBeCloseTo(expectedMagnitude, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 3, 4);
            const oc = oa.magnitude();

            expect(oc).toBeCloseTo(expectedMagnitude, 0.001);
        });

        it('should return the sum of the squares of each component', () =>
        {
            const expectedMagnitudeSquared = (3 * 3) + (4 * 4);
            // Point
            const a = new Point(3, 4);
            const c = a.magnitudeSquared();

            expect(c).toBeCloseTo(expectedMagnitudeSquared, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 3, 4);
            const oc = oa.magnitudeSquared();

            expect(oc).toEqual(expectedMagnitudeSquared);
        });
    });

    describe('project', () =>
    {
        it('should return the vector projection of a vector onto another nonzero vector', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.project(b);

            expect(c.x).toBeCloseTo(33 / 25, 0.001);
            expect(c.y).toBeCloseTo(44 / 25, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.project(ob);

            expect(oc.x).toBeCloseTo(33 / 25, 0.001);
            expect(oc.y).toBeCloseTo(44 / 25, 0.001);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.project(b, a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.project(ob, oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.project(b, { x: 0, y: 0 });

            expect(c.x).toBeCloseTo(33 / 25, 0.001);
            expect(c.y).toBeCloseTo(44 / 25, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.project(ob, { x: 0, y: 0 });

            expect(oc.x).toBeCloseTo(33 / 25, 0.001);
            expect(oc.y).toBeCloseTo(44 / 25, 0.001);
        });

        it('can take any IPointData as other input', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.project({ x: 3, y: 4 });

            expect(c.x).toBeCloseTo(33 / 25, 0.001);
            expect(c.y).toBeCloseTo(44 / 25, 0.001);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.project({ x: 3, y: 4 });

            expect(oc.x).toBeCloseTo(33 / 25, 0.001);
            expect(oc.y).toBeCloseTo(44 / 25, 0.001);
        });
    });

    describe('reflect', () =>
    {
        it('should return the specular reflect vector', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.reflect(b);

            expect(c.x).toEqual(-65);
            expect(c.y).toEqual(-86);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.reflect(ob);

            expect(oc.x).toEqual(-65);
            expect(oc.y).toEqual(-86);
        });

        it('should return the same reference given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.reflect(b, a);

            expect(c).toEqual(a);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.reflect(ob, oa);

            expect(oc).toEqual(oa);
        });

        it('can output into any IPointData given', () =>
        {
            // Point
            const a = new Point(1, 2);
            const b = new Point(3, 4);
            const c = a.reflect(b, { x: 0, y: 0 });

            expect(c.x).toEqual(-65);
            expect(c.y).toEqual(-86);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const ob = new ObservablePoint(observer, 3, 4);
            const oc = oa.reflect(ob, { x: 0, y: 0 });

            expect(oc.x).toEqual(-65);
            expect(oc.y).toEqual(-86);
        });

        it('can take any IPointData as other input', () =>
        {
            // Point
            const a = new Point(1, 2);
            const c = a.reflect({ x: 3, y: 4 });

            expect(c.x).toEqual(-65);
            expect(c.y).toEqual(-86);

            // ObservablePoint
            const oa = new ObservablePoint(observer, 1, 2);
            const oc = oa.reflect({ x: 3, y: 4 });

            expect(oc.x).toEqual(-65);
            expect(oc.y).toEqual(-86);
        });
    });
});


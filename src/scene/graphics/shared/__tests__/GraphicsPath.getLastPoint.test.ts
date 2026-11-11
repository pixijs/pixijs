import { GraphicsPath } from '../path/GraphicsPath';
import { Point } from '~/maths';

describe('GraphicsPath.getLastPoint', () =>
{
    it.each([undefined, false, true])('should return the arc endpoint with counterclockwise=%s', (counterclockwise) =>
    {
        const path = new GraphicsPath().arc(10, 20, 5, 0, Math.PI / 2, counterclockwise);
        const point = new Point();

        expect(path.getLastPoint(point)).toBe(point);
        expect(point.x).toBeCloseTo(10);
        expect(point.y).toBeCloseTo(25);
    });

    it('should return the endpoint of a full circle after closePath', () =>
    {
        const path = new GraphicsPath().arc(10, 20, 5, 0, Math.PI * 2).closePath();
        const point = path.getLastPoint(new Point());

        expect(point.x).toBeCloseTo(15);
        expect(point.y).toBeCloseTo(20);
    });

    it('should start a short quadratic curve at the arc endpoint', () =>
    {
        const path = new GraphicsPath().arc(10, 20, 5, 0, Math.PI / 2).quadraticCurveToShort(30, 40);

        expect(path.instructions[1].data[0]).toBeCloseTo(10);
        expect(path.instructions[1].data[1]).toBeCloseTo(25);
    });

    it('should keep the explicit endpoint of an SVG arc', () =>
    {
        const path = new GraphicsPath().arcToSvg(5, 10, 0, 0, 1, 30, 40);
        const point = path.getLastPoint(new Point());

        expect(point.x).toBe(30);
        expect(point.y).toBe(40);
    });
});

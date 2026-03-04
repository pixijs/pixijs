import { GraphicsPath, Matrix, Point } from '~/bundle.browser';

describe('GraphicsPath', () =>
{
    it('deep clone should break reference to subpath', () =>
    {
        const path = new GraphicsPath().lineTo(12, 34);

        const subPath = new GraphicsPath().lineTo(56, 78);

        path.addPath(subPath);

        const clone = path.clone(true);

        clone.transform(new Matrix().scale(2, 2));

        expect(clone.getLastPoint(new Point())).toEqual(new Point(56 * 2, 78 * 2));
        expect(path.getLastPoint(new Point())).toEqual(new Point(56, 78));
    });

    it('deep clone should break reference to subpath of subpath', () =>
    {
        const path = new GraphicsPath().lineTo(12, 34);

        const firstSubPath = new GraphicsPath().lineTo(56, 78);

        const secondSubPath = new GraphicsPath().lineTo(100, 200);

        firstSubPath.addPath(secondSubPath);
        path.addPath(firstSubPath);

        const clone = path.clone(true);

        clone.transform(new Matrix().scale(2, 2));

        expect(clone.getLastPoint(new Point())).toEqual(new Point(100 * 2, 200 * 2));
        expect(path.getLastPoint(new Point())).toEqual(new Point(100, 200));
    });
});

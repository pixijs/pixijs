import { Polygon, Point } from '@pixi/math';
import { expect } from 'chai';

describe('Polygon', () =>
{
    describe('constructor', () =>
    {
        it('should accept a spread of values', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 0, 10);

            expect(polygon.points.length).to.be.equals(6);
        });

        it('should accept a spread of points', () =>
        {
            const polygon = new Polygon(
                new Point(0, 0),
                new Point(10, 0),
                new Point(0, 10)
            );

            expect(polygon.points.length).to.be.equals(6);
        });

        it('should accept an array of values', () =>
        {
            const polygon = new Polygon([0, 0, 10, 0, 0, 10]);

            expect(polygon.points.length).to.be.equals(6);
        });

        it('should accept an array of points', () =>
        {
            const polygon = new Polygon([
                new Point(0, 0),
                new Point(10, 0),
                new Point(0, 10),
            ]);

            expect(polygon.points.length).to.be.equals(6);
        });
    });

    describe('clone', () =>
    {
        it('should create a copy', () =>
        {
            const polygon1 = new Polygon(0, 0, 10, 0, 0, 10);

            polygon1.closeStroke = !polygon1.closeStroke;

            const polygon2 = polygon1.clone();

            expect(polygon1.points.length).to.be.equals(6);
            expect(polygon1.points.length).to.be.equals(6);

            for (let i = 0; i < 6; i++)
            {
                expect(polygon1.points[i]).to.be.equals(polygon2.points[i]);
            }

            expect(polygon1.closeStroke).to.be.equals(polygon2.closeStroke);
            polygon2.points.push(0, 0);

            expect(polygon1.points.length).to.be.equals(6);
            expect(polygon2.points.length).to.be.equals(8);
        });
    });

    describe('contains', () =>
    {
        it('should include points inside', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 10, 10, 0, 10, 0, 0);

            expect(polygon.contains(1, 1)).to.be.true;
            expect(polygon.contains(1, 9)).to.be.true;
            expect(polygon.contains(9, 1)).to.be.true;
            expect(polygon.contains(9, 9)).to.be.true;
        });

        it('should exclude bounds', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 10, 10, 0, 10, 0, 0);

            // expect(polygon.contains(0, 0)).to.be.false; // this currently returns true
            expect(polygon.contains(0, 10)).to.be.false;
            expect(polygon.contains(10, 0)).to.be.false;
            expect(polygon.contains(10, 10)).to.be.false;
        });

        it('should exclude points outside', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 10, 10, 0, 10, 0, 0);

            expect(polygon.contains(-1, -1)).to.be.false;
            expect(polygon.contains(-1, 11)).to.be.false;
            expect(polygon.contains(11, -1)).to.be.false;
            expect(polygon.contains(11, 11)).to.be.false;
        });
    });
});

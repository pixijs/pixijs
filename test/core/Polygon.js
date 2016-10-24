'use strict';

describe('PIXI.Polygon', () =>
{
    describe('constructor', () =>
    {
        it('should accept a spread of values', () =>
        {
            const polygon = new PIXI.Polygon(0, 0, 10, 0, 0, 10);

            expect(polygon.points.length).to.be.equals(6);
        });

        it('should accept a spread of points', () =>
        {
            const polygon = new PIXI.Polygon(
                new PIXI.Point(0, 0),
                new PIXI.Point(10, 0),
                new PIXI.Point(0, 10)
            );

            expect(polygon.points.length).to.be.equals(6);
        });

        it('should accept an array of values', () =>
        {
            const polygon = new PIXI.Polygon([0, 0, 10, 0, 0, 10]);

            expect(polygon.points.length).to.be.equals(6);
        });

        it('should accept an array of points', () =>
        {
            const polygon = new PIXI.Polygon([
                new PIXI.Point(0, 0),
                new PIXI.Point(10, 0),
                new PIXI.Point(0, 10),
            ]);

            expect(polygon.points.length).to.be.equals(6);
        });
    });

    describe('clone', () =>
    {
        it('should create a copy', () =>
        {
            const polygon1 = new PIXI.Polygon(0, 0, 10, 0, 0, 10);
            const polygon2 = polygon1.clone();

            expect(polygon1.points.length).to.be.equals(6);
            expect(polygon1.points.length).to.be.equals(6);

            for (let i = 0; i < 6; i++)
            {
                expect(polygon1.points[i]).to.be.equals(polygon2.points[i]);
            }

            polygon2.close();

            expect(polygon1.points.length).to.be.equals(6);
            expect(polygon2.points.length).to.be.equals(8);
        });
    });

    describe('close', () =>
    {
        it('should close the polygon if open', () =>
        {
            const polygon = new PIXI.Polygon(0, 0, 10, 0, 0, 10);

            expect(polygon.points.length).to.be.equals(6);

            polygon.close();

            expect(polygon.points.length).to.be.equals(8);
            expect(polygon.points[6]).to.be.equals(0);
            expect(polygon.points[7]).to.be.equals(0);
        });

        it('should do nothing if already closed', () =>
        {
            const polygon = new PIXI.Polygon(0, 0, 10, 0, 0, 10, 0, 0);

            expect(polygon.points.length).to.be.equals(8);

            polygon.close();

            expect(polygon.points.length).to.be.equals(8);
        });
    });
});
